<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * LINE Login (OAuth 2.0 / OIDC) で名前・メールを取得し、
 * 問合せフォーム /gakudo#contact に prefill 用の情報をセッションに格納する。
 *
 * フロー:
 *   1. /auth/line/redirect で LINE 認可エンドポイントへリダイレクト
 *   2. LINE 認可後、/auth/line/callback に code と state が返る
 *   3. token endpoint で code を access_token + id_token に交換
 *   4. /v2/profile で displayName, userId を取得
 *   5. id_token (JWT) の payload から email を取り出す（scope email が許可されている場合）
 *   6. session に line_profile を flash → /gakudo にリダイレクト
 */
class LineAuthController extends Controller
{
    private const AUTHORIZE_URL = 'https://access.line.me/oauth2/v2.1/authorize';
    private const TOKEN_URL     = 'https://api.line.me/oauth2/v2.1/token';
    private const PROFILE_URL   = 'https://api.line.me/v2/profile';

    public function redirect(Request $request): RedirectResponse
    {
        $clientId = (string) config('services.line_login.channel_id');
        if ($clientId === '') {
            Log::warning('LINE Login: channel_id is not configured');
            return redirect()->to(route('gakudo-lp.index').'#contact')
                ->with('line_error', 'LINE連携は未設定です。');
        }

        $state = Str::random(40);
        $nonce = Str::random(40);
        $request->session()->put('line_oauth_state', $state);
        $request->session()->put('line_oauth_nonce', $nonce);

        $params = http_build_query([
            'response_type' => 'code',
            'client_id'     => $clientId,
            'redirect_uri'  => route('line.callback'),
            'state'         => $state,
            'scope'         => 'profile openid email',
            'nonce'         => $nonce,
            // prompt=consent ですでに連携済みでも毎回確認画面を出すこともできる。
            // UX 重視で省略（ユーザーは初回のみ認可）。
        ]);

        return redirect()->away(self::AUTHORIZE_URL.'?'.$params);
    }

    public function callback(Request $request): RedirectResponse
    {
        $expected = $request->session()->pull('line_oauth_state');
        if (!$expected || $request->input('state') !== $expected) {
            Log::warning('LINE Login: state mismatch', [
                'expected' => $expected,
                'got'      => $request->input('state'),
            ]);
            return $this->backTo('LINE連携でエラーが発生しました（state不一致）。');
        }

        if ($request->has('error')) {
            $errMsg = (string) $request->input('error_description', $request->input('error'));
            return $this->backTo('LINE認可がキャンセルされました：'.$errMsg);
        }

        $code = (string) $request->input('code');
        if ($code === '') {
            return $this->backTo('LINEから認可コードが取得できませんでした。');
        }

        $clientId     = (string) config('services.line_login.channel_id');
        $clientSecret = (string) config('services.line_login.channel_secret');
        if ($clientId === '' || $clientSecret === '') {
            Log::warning('LINE Login: credentials missing on callback');
            return $this->backTo('LINE連携の設定が未完了です。');
        }

        try {
            $tokenRes = Http::asForm()->timeout(10)->post(self::TOKEN_URL, [
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'redirect_uri'  => route('line.callback'),
                'client_id'     => $clientId,
                'client_secret' => $clientSecret,
            ]);
        } catch (\Throwable $e) {
            Log::warning('LINE Login: token request threw '.$e->getMessage());
            return $this->backTo('LINE通信エラーが発生しました。');
        }

        if (!$tokenRes->ok()) {
            Log::warning('LINE Login: token exchange failed', [
                'status' => $tokenRes->status(),
                'body'   => $tokenRes->body(),
            ]);
            return $this->backTo('LINEのアクセストークン取得に失敗しました。');
        }

        $tokenJson   = $tokenRes->json();
        $accessToken = (string) ($tokenJson['access_token'] ?? '');
        $idToken     = (string) ($tokenJson['id_token']     ?? '');

        if ($accessToken === '') {
            return $this->backTo('LINEのアクセストークンが空でした。');
        }

        // Profile 取得
        try {
            $profileRes = Http::withToken($accessToken)->timeout(10)->get(self::PROFILE_URL);
        } catch (\Throwable $e) {
            Log::warning('LINE Login: profile request threw '.$e->getMessage());
            return $this->backTo('LINE通信エラーが発生しました。');
        }
        $profile = $profileRes->ok() ? $profileRes->json() : [];

        // id_token から email 抽出（scope email が許可されている場合のみ）
        $email = $this->emailFromIdToken($idToken);

        $payload = [
            'user_id' => (string) ($profile['userId']      ?? ''),
            'name'    => (string) ($profile['displayName'] ?? ''),
            'email'   => $email,
        ];

        // 1リクエストだけ持ち越す flash session に格納。controller→Blade→React の data-settings 経由で渡る。
        $request->session()->flash('line_profile', $payload);

        return redirect()->to(route('gakudo-lp.index').'#contact');
    }

    /**
     * id_token (JWT) の payload から email を取り出す。
     *
     * LINE Login の id_token は HS256 で署名されており、署名検証をすべきだが、
     * ここでは「自分自身が直前に発行したコードを直接交換した結果」のため
     * 中間者改ざんのリスクは低い。厳密にやるなら下記手順:
     *   1) header の alg=HS256 を確認
     *   2) base64url(payload) を HMAC-SHA256(channel_secret) で検証
     *   3) aud == channel_id, iss == 'https://access.line.me', exp > now を確認
     *   4) nonce が session 保存値と一致
     *
     * いまは email の prefill 用途のみなので、payload を decode するだけにとどめる。
     */
    private function emailFromIdToken(string $idToken): ?string
    {
        if ($idToken === '') return null;
        $parts = explode('.', $idToken);
        if (count($parts) !== 3) return null;

        $payload = json_decode($this->b64UrlDecode($parts[1]), true);
        if (!is_array($payload)) return null;

        $email = $payload['email'] ?? null;
        return is_string($email) && $email !== '' ? $email : null;
    }

    private function b64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }

    private function backTo(string $errMsg): RedirectResponse
    {
        return redirect()->to(route('gakudo-lp.index').'#contact')
            ->with('line_error', $errMsg);
    }
}
