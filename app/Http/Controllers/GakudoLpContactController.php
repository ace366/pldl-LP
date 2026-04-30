<?php

namespace App\Http\Controllers;

use App\Mail\GakudoLpContactReceived;
use App\Models\GakudoLpContact;
use App\Models\LpSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class GakudoLpContactController extends Controller
{
    public function show()
    {
        $settings = LpSetting::allCached();

        $bool = fn ($k) => isset($settings[$k]) && $settings[$k]['value'] === '1';
        $val  = fn ($k, $d = '') => $settings[$k]['value'] ?? $d;

        $payload = [
            'lineConsultUrl'      => $val('line_consult_url'),
            'introVideoUrl'       => $val('intro_video_url'),
            'documentRequestUrl'  => $val('document_request_url'),
            'fvCtaText'           => $val('fv_cta_text', '無料デモを予約する'),
            'campaignText'        => $val('campaign_text'),
            'showInitialFeeZero'  => $bool('show_initial_fee_zero'),
            'showSupportFree'     => $bool('show_support_free'),
            'receptionClosed'     => $bool('reception_closed'),
            'receptionClosedMsg'  => $val('reception_closed_message'),
            'gaMeasurementId'     => $val('ga_measurement_id'),
            'gscVerification'     => $val('gsc_verification'),
            'noindex'             => $bool('noindex'),
            'privacyPolicy'       => $val('privacy_policy'),
            'pamphletUrl'         => $val('pamphlet_url'),
            'contactEndpoint'     => route('gakudo-lp.contact'),
        ];

        return view('gakudo-lp.index', [
            'lpSettings' => $payload,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Honeypot — 人間に見えない hidden field "website" を bot は埋めてくる。
        // 値が入っていたら受付成功を装って静かに無視する（200 を返してログだけ残す）。
        if ($request->filled('website')) {
            Log::warning('LP contact honeypot triggered', [
                'ip' => $request->ip(),
                'ua' => substr((string) $request->userAgent(), 0, 200),
                'website' => substr((string) $request->input('website'), 0, 200),
            ]);
            return response()->json([
                'ok' => true,
                'message' => 'お問い合わせありがとうございます。内容を確認のうえ、ご連絡いたします。',
            ]);
        }

        if (LpSetting::getValue('reception_closed') === '1') {
            return response()->json([
                'ok' => false,
                'message' => LpSetting::getValue(
                    'reception_closed_message',
                    '現在、新規のお問い合わせ受付を一時停止しております。'
                ),
            ], 423);
        }

        $validated = $request->validate([
            'facility'       => ['required', 'string', 'max:100'],
            'name'           => ['required', 'string', 'max:100'],
            'email'          => ['required', 'email', 'max:255'],
            'tel'            => ['nullable', 'string', 'max:30'],
            'children_count' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'purpose'        => ['nullable', 'string', 'max:50'],
            'message'        => ['nullable', 'string', 'max:5000'],
            'utm_source'     => ['nullable', 'string', 'max:100'],
            'utm_medium'     => ['nullable', 'string', 'max:100'],
            'utm_campaign'   => ['nullable', 'string', 'max:100'],
        ]);

        $contact = GakudoLpContact::create(array_merge($validated, [
            'status'     => GakudoLpContact::STATUS_NEW,
            'source'     => 'lp',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
        ]));

        $to = LpSetting::getValue('admin_notify_email')
            ?: config('mail.from.address');

        if ($to) {
            try {
                Mail::to($to)->send(new GakudoLpContactReceived($contact));
            } catch (\Throwable $e) {
                Log::warning('LP contact mail failed: '.$e->getMessage(), [
                    'contact_id' => $contact->id,
                ]);
            }
        }

        return response()->json([
            'ok' => true,
            'message' => 'お問い合わせありがとうございます。内容を確認のうえ、ご連絡いたします。',
        ]);
    }
}
