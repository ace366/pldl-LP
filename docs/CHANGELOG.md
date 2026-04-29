# 変更履歴

このプロジェクトの変更履歴を記録します。
新しい変更は **先頭に追記** してください。形式：

```
## YYYY-MM-DD HH:MM JST  <commit-hash or "uncommitted">
- 変更内容（要点）
- 関連ファイル / ルート / DB変更
```

---

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
