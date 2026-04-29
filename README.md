# PLDL 学童向けLP

NPO法人 Playful Learning Design Lab.（PLDL）が、教育現場の実運営から得た知見をもとに開発した
学童向け運営システムのランディングページ（LP）です。

> 単なるシステム販売ではなく、子どもたちの居場所づくり・学びの場づくりに取り組む法人が、
> 現場課題から生まれた仕組みを伝える相談型LPです。

## 1. システム概要

| 項目 | 内容 |
|---|---|
| LP 公開URL | `/gakudo` |
| 管理画面URL | `/admin/lp-settings` （要ログイン） |
| バックエンド | Laravel 11（PHP 8.3） |
| フロント | React 18 + TypeScript + Vite |
| 認証 | Laravel Breeze（管理画面のみ） |
| DB | SQLite（`database/database.sqlite`） |
| メール | Laravel Mail（既定は log ドライバ。本番は SMTP 推奨） |
| ホスティング想定 | さくらレンタルサーバー |

主要テーブル：
- `gakudo_lp_contacts` — 問い合わせ受信ログ（UTM・IP・UA含む）
- `lp_settings` — LP裏側のキー・バリュー設定（メール通知先、各種URL、キャンペーン文言、受付停止フラグ等）

## 2. ローカル起動方法

前提：
- PHP 8.3+, Composer 2+, Node.js 20+ / npm 10+

```
# 依存導入
composer install
npm install

# 環境ファイル
copy .env.example .env       # Windows
# cp .env.example .env       # macOS / Linux
php artisan key:generate

# DB（SQLite）
# database/database.sqlite が無ければ作成
php artisan migrate

# 開発時
php artisan serve --host=127.0.0.1 --port=8000
npm run dev
```

ローカル確認URL：

```
http://127.0.0.1:8000/gakudo
```

管理画面ログインの初回登録（開発時）：

```
http://127.0.0.1:8000/register
```

登録後、`/admin/lp-settings` で各種裏側設定を変更できます。

## 3. 本番ビルド方法（さくら向け）

サーバー側では `npm` を使わず、**ローカルでビルドしたものをアップロード**します。

```
composer install --no-dev --optimize-autoloader
npm ci
npm run build         # → public/build/* に Vite の成果物が出力されます
```

`public/build` を含めてアップロードします。詳細は `docs/DEPLOY_SAKURA.md` を参照してください。

## 4. GitHub 運用

- リモート: https://github.com/ace366/pldl-LP.git
- `.env` は Git に含めません（`.env.example` を必ず更新する）
- 変更のたびに必ず `git commit` → `git push`
- 設計方針・仕様変更は `docs/*.md` に追記してから実装

```
git add .
git commit -m "feat: ..."
git push
```

## 5. さくらサーバーへの配置方法（要点）

- ローカルで `composer install --no-dev` と `npm run build` を実行
- アップロード対象: `app/`, `bootstrap/`, `config/`, `database/`, `public/`, `resources/`, `routes/`, `vendor/`, `storage/app/` の必要分, `composer.json`, `composer.lock`, `artisan`
- 除外対象: `node_modules/`, `.git/`, `tests/`, `storage/logs/*.log`, `.env`（本番用は別途用意）
- ドキュメントルートは `public/` を指す設定にする（`.htaccess` または公開ディレクトリ設定）
- 本番 `.env` の `APP_URL` は実 URL に書き換える
- DB は SQLite (`database/database.sqlite`) のままで運用可能。MySQL に切り替える場合は `.env.example` の例を参照

詳細は `docs/DEPLOY_SAKURA.md` を参照してください。

## 6. ディレクトリ構成（抜粋）

```
app/
  Http/Controllers/
    GakudoLpContactController.php          # LP本体・問い合わせ
    Admin/LpSettingsController.php         # 管理画面
  Mail/GakudoLpContactReceived.php         # 問い合わせ受信通知
  Models/
    GakudoLpContact.php
    LpSetting.php
database/migrations/
  2026_04_30_000001_create_gakudo_lp_contacts_table.php
  2026_04_30_000002_create_lp_settings_table.php
resources/
  css/app.css                              # LP/共通CSS（tailwind含む）
  js/
    gakudo-lp.tsx                          # LP用エントリポイント（vanilla React）
    pages/GakudoLp.tsx                     # LPページ本体
    components/lp/                         # LP用コンポーネント群
    app.tsx                                # Breeze（管理画面）用エントリ（Inertia）
  views/
    gakudo-lp/index.blade.php              # LPホストBlade（CSRF + Vite）
    admin/lp-settings/index.blade.php      # 管理画面
    emails/gakudo-lp/contact-received.blade.php
routes/web.php
docs/                                      # 設計・運用ドキュメント
```

## 7. 関連ドキュメント

- `docs/PROJECT_RULES.md` — プロジェクト共通ルール（**変更前に必ず参照**）
- `docs/DEPLOY_SAKURA.md` — さくらレンタルサーバーへのデプロイ手順
- `docs/SETTINGS.md` — LP裏側の設定項目一覧
- `docs/CHANGELOG.md` — 変更履歴

## 8. 表記ルール

- 法人正式名称: **NPO法人 Playful Learning Design Lab.**
- 初出表記: `NPO法人 Playful Learning Design Lab.（PLDL）`
- 略称: `PLDL` または `NPO法人 Playful Learning Design Lab.`
- **「PLDL学童」「PLDL塾」のような略称は使用禁止**
- 公式サイト: https://pldl.or.jp/
