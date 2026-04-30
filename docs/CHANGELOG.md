# 変更履歴

このプロジェクトの変更履歴を記録します。
新しい変更は **先頭に追記** してください。形式：

```
## YYYY-MM-DD HH:MM JST  <commit-hash or "uncommitted">
- 変更内容（要点）
- 関連ファイル / ルート / DB変更
```

---

## 2026-04-30  「無料デモを予約」ボタンが hover まで見えない不具合を修正

`.lp-root a { color: var(--lp-color-primary) }` のグローバル指定が `.lp-btn--primary` の dark テキスト指定より特異度が高く、黄色背景に黄色文字で透明同然になっていた。:hover 時のみ `.lp-btn--primary:hover`（特異度 0,2,0）が勝って白文字に切り替わるためポインター時のみ見える状態。

`.lp-root a:not(.lp-btn):not(.lp-header__brand)` に変更してボタンとヘッダーロゴを除外。

---

## 2026-04-30  サブパス公開で画像/エンドポイントが壊れていたのを修正

`/pldl-lp` サブパス公開時、React 内のハードコード絶対パス（`/images/...`、`/gakudo/contact`）がドメイン直下を見に行って 404 になっていた。

### 修正
- `resources/js/lib/asset.ts` に `asset(path)` ヘルパー追加。`window.__APP_URL__` を読んで base URL を前置する
- Blade で `<div data-app-url="{{ rtrim(config('app.url'), '/') }}">` を出力 → `gakudo-lp.tsx` で `window.__APP_URL__` に設定
- `Hero.tsx` / `Solutions.tsx` / `WhyPldl.tsx` / `FieldIssues.tsx` の 21 個の `<img src>` を `asset(...)` で包む
- `contactEndpoint` のデフォルト値も `asset('/gakudo/contact')` に

ローカル開発（`APP_URL=http://127.0.0.1:8000`）では `asset('/images/foo')` → `http://127.0.0.1:8000/images/foo` で従来通り動く。

---

## 2026-04-30  さくらサブパス公開向けに public/index.php を補正

`https://top-ace-picard.sakura.ne.jp/pldl-lp` のような **サブパス公開**で Laravel が 404 を返していた問題を修正。

### 症状
さくらの自動リライト（`/pldl-lp/foo` → `/pldl-lp/public/foo`）後、PHP に渡る `SCRIPT_NAME` が `/pldl-lp/public/index.php` になるが `REQUEST_URI` は `/pldl-lp/foo` のまま。Symfony の baseUrl 検出が `/pldl-lp` を剥がせず、Laravel ルーターには `/pldl-lp/foo` が渡って 404。

### 修正
`public/index.php` の冒頭で `SCRIPT_NAME` / `PHP_SELF` の `/public/index.php` を `/index.php` に置換。これで Symfony が dirname(`/pldl-lp/index.php`) = `/pldl-lp` を baseUrl として認識し、pathInfo が `/foo` に正規化される。

ローカル開発（`/public` がパスに含まれない）では no-op。

### 関連
- 影響パス例: `/pldl-lp/gakudo` ✓ 200、`/pldl-lp/admin/lp-settings` 等

---

## 2026-04-30  デプロイスクリプトを zip → tar.gz に切替

PowerShell `Compress-Archive` 経由のZIPだとさくら側 `unzip` で失敗するケースがあったため、Windows 同梱の BSD tar (`%SystemRoot%\System32\tar.exe`) で `tar.gz` を作成する方式に変更。

- 初回デプロイで `unzip -oq` が `set -e` で失敗 → tar.gz では成功確認済み
- `bat` 側は GNU tar が `C:\` をリモートホスト解釈してしまうので必ず System32 の tar.exe を使う

## 2026-04-30  さくらレンタルサーバー向けデプロイスクリプト追加

manaloom の deploy 方式を踏襲し、ローカルから一発で `/home/top-ace-picard/www/pldl-lp` へアップロードできる構成を追加。

### 追加ファイル
- `deploy_pldl_lp_to_sakura.bat` — Windows 側エントリ。`npm run build` → robocopy staging → zip → SCP → リモートで .sh 実行
- `remote_deploy_pldl_lp.sh` — サーバー側で展開・差し替え。`vendor/`・`storage/`・`.env`・`*.sqlite` は維持
- `docs/sakura-env.production.txt` — 本番 `.env` のテンプレ

### 運用
- 「サーバーにあげて」のフレーズで起動（auto-memory に登録）
- 初回は SSH で `composer install` / `.env` 配置 / `key:generate` / `migrate` の手作業が必要

---

## 2026-04-30  パンフレットを8ページ→11ページに拡張（LPと同期）

LP側で行った機能拡張・モックアップ追加・比較強化を、パンフレット（`docs/pamphlet.html`）にも反映。

### ページ構成（旧8 → 新11）
| # | セクション | 状態 |
|---|---|---|
| 1 | 表紙 | 既存 |
| 2 | お悩み | 既存 |
| 3 | 解決策（**6→9機能**） | 拡張 |
| 4 | アプリ画面（6スクショ） | **新規** |
| 5 | さらにできること（4×4=16機能） | **新規** |
| 6 | 運営団体 | 既存（フッター番号 04→06） |
| 7 | Before/After | 既存（同 05→07） |
| 8 | 他社との比較（14行） | **新規** |
| 9 | 料金 | 既存（同 06→09） |
| 10 | 導入の流れ | 既存（同 07→10） |
| 11 | 最終 CTA | 既存（同 08→11） |

### 解決策の機能（9個）
欠席・遅刻連絡 ／ お迎え変更・送迎管理 ／ QR出席確認・手入力対応 ／ 保護者通知・お知らせ ／
月次CSV／PDF出力 ／ TEL票・履歴保存 ／ きょうだい・複数保護者 ／ アレルギー・緊急情報 ／ 権限管理・スタッフ勤怠

### アプリ画面（印刷用ミニフォン6面）
my-qr ／ attendance-intents ／ attendance/scan ／ admin/children ／ children/{id}/tel ／ admin/chats
- 純HTML/CSSで描画（外部画像なし）。CSSグリッドで作るQR、ダーク背景のスキャン画面、TEL票履歴の電話／面談／メールタブなど

### 機能ラインナップ（4グループ×4項目）
For Office（締め・CSV/PDF・権限・お知らせ画像）
For Field Staff（出勤QR・シフト・勤怠ログ・給与）
For Families（LINE・きょうだい・プロフィール・利用予定）
For Children（児童QR・TTS・なぞなぞ・大きなUI）

### 比較表（14行）
QRカード忘れ対応／受付の体験／きょうだい管理／保護者通知／送迎対応／TEL票履歴／出力／スタッフ運用／権限管理 など、実機能差分を反映。誇大表現なし＋他社特定回避の注記付き。

### 印刷時の留意
- A4縦・page-break-after 全 11 ページに適用
- 「背景のグラフィック ON」必須（Chrome印刷ダイアログで指定）

## 2026-04-30  実機能を反映したLP拡張（モックアップ3画面追加・比較強化・新セクション）

C:\work\pldl のソース（routes/web.php、admin系コントローラ24個、Blade）を精読し、実装機能を網羅した上でLPを拡張。

### モックアップ追加（AppScreens セクション）
3画面追加して合計6画面（旧3 + 新3）。
- **QRスキャン受付**（`app.pldl.or.jp/admin/attendance/scan`）
    - カメラ枠（4隅マーカー＋走査線）／読み取り結果カード／音声案内ON表示／QRカード忘れ用の手入力欄
    - 元画面の特徴（音声案内 TTS、なぞなぞ表示、手入力フォールバック、連続スキャン制御）を反映
- **児童名簿**（`app.pldl.or.jp/admin/children`）
    - 検索＋学年／在籍／アレルギー絞り込みチップ／表ヘッダ（学年・氏名・拠点・タグ）／アレルギー・きょうだいバッジ
- **TEL票・きょうだい管理**（`app.pldl.or.jp/admin/children/{id}/tel`）
    - 児童ヘッダ（在籍ピル・学年・拠点・学校）／きょうだいタグ（タップで往復）／履歴（電話・面談・メールカテゴリ）

### 機能ラインナップ拡張（Solutions）
6項目 → **9項目**へ。新規追加：きょうだい・複数保護者管理／アレルギー・緊急情報／権限管理・スタッフ勤怠。

### 新セクション「More Capabilities」（Capabilities.tsx）
事務・現場スタッフ・保護者・子どもの4視点で計16機能を整理。
- 月次締め処理、CSV/PDF出力、ロール別権限、お知らせ画像添付
- スタッフ出勤QR、シフトカレンダー、勤怠ログ、給与・源泉インポート
- LINE連携、きょうだい紐付け、プロフィール／アバター、日別利用予定
- 児童QR、TTS音声案内、なぞなぞ表示、片手UI

### 比較表強化（Differentiation）
5行 → **14行**へ。具体差分を増強：
- QRカード忘れ対応（手入力フォールバック）／受付の体験（音声・なぞなぞ）
- きょうだい管理／保護者通知（LINE・既読）／送迎対応／TEL票履歴
- 出力（CSV/PDF）／スタッフ運用（出勤QR・シフト・給与）／権限管理
- 末尾に「個別他社サービスを指すものではない」旨の注記

### CSS
.lp-mock--children, .lp-mock--scan, .lp-mock--tel と関連クラス、.lp-cap*, .lp-compare__note を追加。

### 動作確認
- npm run build: 成功（GakudoLp 35.9KB → 49.2KB へ拡張）
- GET /gakudo: 200

## 2026-04-30  営業用パンフレット（A4縦・8ページ）を追加

- `docs/pamphlet.html` を新規作成。資料請求時に送付する高品質パンフレット。
    - 完全自己完結（CSS全インライン、外部依存は Google Bunny の Noto Sans JP のみ）
    - A4縦・8ページ構成・`page-break-after: always` 対応
    - 印刷時はカラー保持（`-webkit-print-color-adjust: exact`）
    - スマホ閲覧でも読みやすいレスポンシブ（max-width 900px で縦積みに）
    - 配色: 青 `#0d3b66 / #1e6ec0` × オレンジ `#ea7c25` × 白
    - 構成: 表紙／お悩み／解決策／運営団体／Before-After／料金／導入の流れ／CTA
    - 実績数字の捏造・誇大表現はなし。ブランド表記ルール（初出は正式名称）遵守

## 2026-04-30  管理画面ログイン系の日本語化 + パスワードを数字4桁に変更

- パスワードバリデーションを `Rules\Password::defaults()`（min:8 + 複雑度）から `digits:4`（半角数字4桁）に緩和
    - 対象: `RegisteredUserController::store`, `NewPasswordController::store`, `PasswordController::update`
- フロント（Breeze の Inertia + React）の Auth/Profile 画面をすべて日本語化
    - `pages/Auth/Register.tsx`, `Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `ConfirmPassword.tsx`, `VerifyEmail.tsx`
    - `pages/Profile/Edit.tsx`, `Profile/Partials/UpdateProfileInformationForm.tsx`, `UpdatePasswordForm.tsx`, `DeleteUserForm.tsx`
    - パスワード入力欄に `inputMode="numeric"`, `pattern="\d{4}"`, `maxLength={4}` を追加（スマホで数字キーパッド表示）
- `layouts/AuthenticatedLayout.tsx` のナビ: Dashboard → 管理画面、Profile → プロフィール、Log Out → ログアウト
- 日本語ロケールファイルを新規作成
    - `lang/ja/validation.php` — Laravel 全バリデーションメッセージ（`required`/`email`/`digits`/`confirmed` 等）
    - `lang/ja/auth.php` — `auth.failed`, `auth.password`, `auth.throttle`
    - `lang/ja/passwords.php` — パスワード再設定関連メッセージ
- 動作確認済
    - `POST /register { password: '1234' }` → 302（成功）、`gakudo_lp_contacts` 用とは別の `users` テーブルに保存
    - `POST /register { password: '12' }` → 302（バリデーションエラーで戻る、登録されない）

## 2026-04-30  黄色ベースに再テーマ化 + /register エラー修正

- ブランドカラーを緑から黄色（PLDLロゴの長靴色）に変更
    - `--lp-color-primary`: `#1f7a4d` → `#f5b81a`
    - `--lp-color-primary-strong`: `#155e3a` → `#b45309`（amber-700。テキスト用）
    - `--lp-color-primary-soft`: `#e6f4ec` → `#fef3c7`
    - 新規 `--lp-color-on-primary`: `#0f172a`（黄色背景上の文字色）
- 主要 CTA ボタンの文字を「default 状態でも読める」形に：
    - `.lp-btn--primary` の文字色を `#fff` → `#0f172a`（黄色＋濃紺）。hover時は濃いamberに白文字。
    - `.lp-plan__ribbon`, `.lp-mock__chip--filter.is-on`, `.lp-header__brand-mark`, `.lp-hero__phone-row--head` も同様にダーク文字へ
    - `.lp-section__eyebrow`, `.lp-hero__title-em`, `.lp-effect__label--after`, `.lp-plan__features li::before` を amber-700 に揃えて視認性確保
- 緑系のグラデ・ボーダー（Hero 背景・運営団体カード・Video サムネ・Avatar 等）をすべて amber/yellow 系へ置換
- /register が `Vite manifest: resources/js/Pages/Auth/Register.tsx` で 500 になっていた問題を修正
    - 原因: `resources/views/app.blade.php` の `@vite()` ディレクティブが大文字 `Pages/` を参照していた
    - 修正: 小文字 `pages/` に統一（先日の Pages → pages リネームに合わせる）
    - 確認: `/register`, `/login`, `/gakudo` すべて 200

## 2026-04-30  アプリ画面のダミーモックアップを追加

- 新セクション `App Screens` を Solutions と Video の間に追加
    - `resources/js/components/lp/AppScreens.tsx` — 3画面のスマホフレームモックアップ
    - 1画面目: `app.pldl.or.jp/my-qr` 相当（スタッフQR・拠点・ID 表示）
    - 2画面目: `app.pldl.or.jp/admin/attendance-intents` 相当（参加予定・送迎管理）
    - 3画面目: `app.pldl.or.jp/admin/chats` 相当（保護者チャットスレッド）
    - 表示している氏名・施設名・メッセージ・QRコードは **すべてダミー**（実在しない）
    - QRはSVGで生成した視覚イメージのみで、スキャンしても無効
- 参考にしたソース（C:\work\pldl）：
    - `resources/views/my_qr/show.blade.php`
    - `resources/views/admin/attendance_intents/react.blade.php`
    - `resources/js/pages/admin/AttendanceIntentsApp.jsx`
    - `resources/views/admin/chats/index.blade.php`
- CSS: `.lp-screens`, `.lp-screen-card`, `.lp-phoneframe*`, `.lp-mock*` を追加。スマホフレーム260px / 画面高480pxの統一フォーマット
- pages/GakudoLp.tsx に `<AppScreens />` を組み込み

## 2026-04-30  PLDLロゴを撤去

- 依頼により PLDL のブランドロゴ画像を LP から全削除
    - 削除箇所: Header / Hero / WhyPldl 運営団体カード / Footer
    - Header はテキスト「PLDL」マーク + 法人名表記に戻し
    - Hero の `lp-hero__brand-card` を撤去（電話モックアップは残置）
    - Footer は法人名テキスト + 公式サイトリンクのみに
- `public/images/` から削除: `ver1.png`, `ver2.png`, `1080_1350.jpg`, `1200_400.jpg`, `1920_1080.jpg`, `512_512.jpg`
- 機能アイコン（QR/send/school/guardian/press/car/save/info/parents/attendance等）は残置
- 不要 CSS（`.lp-header__brand-logo`, `.lp-hero__brand-card*`, `.lp-org-card__logo`, `.lp-footer__org-logo`）を削除

## 2026-04-30  ブランド・ビジュアル素材を統合

- `C:\work\pldl\public\images\` から PLDL 公式ロゴ・機能アイコン群を `public/images/` にコピー
    - 公式ロゴ: `ver1.png`, `ver2.png`, `1200_400.jpg`, `1080_1350.jpg`, `1920_1080.jpg`, `512_512.jpg`
    - 機能アイコン: `attendance.png`, `QR.png`, `send.png`, `school.png`, `guardian.png`, `parents.png`, `login.png`, `info.png`, `base.png`, `car.png`, `press.png`, `new.png`, `save.png`, `add_school.png`, `add_guardian.png`, `expansion.png`
- LPコンポーネントへの組み込み：
    - Header: テキスト「PLDL」マークを `ver2.png` ロゴに差し替え
    - Hero: 「運営団体ロゴ」カード（`ver1.png`）を視覚要素として追加。電話モックアップの各行にも機能アイコンを表示
    - WhyPldl: 各カードに丸アイコン（school / press / guardian / info）を表示。運営団体カードに公式ロゴを大きく配置
    - FieldIssues: 絵文字アイコンを実画像（press / car / attendance / save / parents）に差し替え
    - Solutions: 各機能カードに対応アイコン（press / car / QR / send / save / info）を表示
    - Footer: 公式ロゴ（`ver1.png`）を白背景パネルで配置
- スタイル追加: `.lp-header__brand-logo`, `.lp-hero__brand-card`, `.lp-card--with-icon`, `.lp-card__icon`, `.lp-org-card__logo`, `.lp-feature__icon`, `.lp-footer__org-logo` 等

## 2026-04-30  初版構築

- Laravel 11 プロジェクトを `C:\work\PLDL-LP` に新規作成
- Laravel Breeze（React + TypeScript + Inertia）導入。管理画面ログイン用。
- 学童向け LP を新規実装：
    - エントリ: `resources/js/gakudo-lp.tsx`
    - ページ: `resources/js/pages/GakudoLp.tsx`
    - コンポーネント: `resources/js/components/lp/`（Header / Hero / WhyPldl / FieldIssues / Solutions / VideoSection / AfterEffects / Differentiation / Pricing / ContactForm / Footer）
    - スタイル: `resources/css/app.css` 内の `.lp-root` スコープ
    - Blade ホスト: `resources/views/gakudo-lp/index.blade.php`
- 問い合わせ機能：
    - DB テーブル `gakudo_lp_contacts`（マイグレーション `2026_04_30_000001_*`）
    - Model: `App\Models\GakudoLpContact` + `statusLabels()`
    - Controller: `App\Http\Controllers\GakudoLpContactController` (`show`, `store`)
    - Mail: `App\Mail\GakudoLpContactReceived`
    - メールBlade: `resources/views/emails/gakudo-lp/contact-received.blade.php`
    - ルート: `GET /gakudo`, `POST /gakudo/contact`
- 管理画面：
    - DB テーブル `lp_settings`（マイグレーション `2026_04_30_000002_*`、初期値投入済み）
    - Model: `App\Models\LpSetting`（`getValue` / `setValue` / `allForAdmin` / キャッシュ）
    - Controller: `App\Http\Controllers\Admin\LpSettingsController` (`index`, `update`)
    - View: `resources/views/admin/lp-settings/index.blade.php`
    - ルート: `GET /admin/lp-settings`, `PUT /admin/lp-settings`（auth ミドルウェア）
- ブランド表記方針：
    - 「PLDL学童」等の組み合わせ略称を完全排除。
    - 正式名称「NPO法人 Playful Learning Design Lab.」を初出表記とし、以降は「PLDL」も併用可。
    - 公式サイト https://pldl.or.jp/ を Why セクション・Footer に配置。
- ドキュメント：
    - `README.md` を全面書き換え
    - `docs/PROJECT_RULES.md`, `docs/DEPLOY_SAKURA.md`, `docs/SETTINGS.md`, `docs/CHANGELOG.md` を新規作成
- 動作確認済：
    - `php artisan migrate` 通過
    - `npm run build` 通過（TypeScript 型チェック含む）
    - `php artisan serve` 経由で `/gakudo` 200、CSRF 出力、`gakudo-lp-root` 出力確認
    - `POST /gakudo/contact` が JSON `{ ok: true, message: ... }` を返し、`gakudo_lp_contacts` に保存されることを確認
- ローカル確認URL: http://127.0.0.1:8000/gakudo
