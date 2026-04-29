# さくらレンタルサーバー デプロイ手順

このドキュメントは、本 LP を「さくらインターネット レンタルサーバー（スタンダード以上）」に
配置するための手順をまとめたものです。

> **重要**: さくらレンタルサーバー側では `npm run build` を実行しません。
> ビルドはすべてローカルで行い、`public/build/` を含めてアップロードします。

## 0. 前提

- PHP 8.3 系（さくら側で `mod_php` または CGI モードのいずれかで利用可能）
- 独自ドメイン or サブドメインで `public/` 配下を公開できる構成
- SSH / FTP / SFTP / rsync いずれかでアップロード可能

## 1. ローカルでビルド

```
composer install --no-dev --optimize-autoloader
npm ci
npm run build         # → public/build/* に Vite の成果物
php artisan migrate   # ローカルDBを最新化（任意）
php artisan optimize:clear
```

`public/build/` 配下にハッシュ付きの JS / CSS が出力されることを確認します。
このビルド成果物を **必ずアップロード対象に含めて** ください。

## 2. アップロード対象

含めるもの：

- `app/`
- `bootstrap/`
- `config/`
- `database/`（`migrations/` を含む。`database/database.sqlite` は本番側で別途用意するため除外可）
- `public/`（`public/build/` を含むこと）
- `resources/`
- `routes/`
- `storage/`（必要なサブディレクトリのみ。下記参照）
- `vendor/`
- `composer.json`
- `composer.lock`
- `artisan`
- `.htaccess`（必要に応じてサーバー設定に合わせて配置）

`storage/` は次の構成で本番側に **空のまま存在** させます（権限 0775 推奨）：

```
storage/
  app/
    public/
  framework/
    cache/
    sessions/
    testing/
    views/
  logs/
```

除外するもの：

- `node_modules/`
- `.git/`
- `tests/`
- `storage/logs/*.log`
- `.env`（本番側で別途用意）
- `database/database.sqlite`（本番側で別途作成）

## 3. .htaccess

Laravel 既定の `public/.htaccess` をそのまま利用します。

```
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    RewriteCond %{REQUEST_FILENAME} -d [OR]
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ ^$1 [N]

    RewriteCond %{REQUEST_URI} (\.\w+$) [NC]
    RewriteRule ^(.*)$ - [L]

    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

ドキュメントルートが `public/` を直接指せない場合（共有サーバーで `~/www/` がルート等）は、
プロジェクトをドメイン外のディレクトリに置き、`~/www/` 直下に `public/` の中身をシンボリックリンク
または `index.php` の `require __DIR__.'/../`相対パスを書き換える形で対応します。

## 4. .env（本番）

本番用 `.env` をサーバー側に手動配置します。最低限の例：

```
APP_NAME="PLDL Gakudo LP"
APP_ENV=production
APP_KEY=base64:本番用キー（php artisan key:generate で発行）
APP_DEBUG=false
APP_URL=https://your-domain.example.com
APP_TIMEZONE=Asia/Tokyo
APP_LOCALE=ja

LOG_CHANNEL=stack
LOG_LEVEL=warning

DB_CONNECTION=sqlite
DB_DATABASE=/home/your-account/your-app/database/database.sqlite

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=さくらSMTPホスト
MAIL_PORT=587
MAIL_USERNAME=送信用アドレス
MAIL_PASSWORD=パスワード
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@pldl.or.jp
MAIL_FROM_NAME="${APP_NAME}"
```

> `DB_DATABASE` は **絶対パス**で指定すると、cron / artisan のどこから実行しても同じ DB を参照できます。

## 5. APP_URL

- 本番ドメインを正確に設定してください。`APP_URL` がずれていると、`@vite()` で出力される
  CSS / JS のパス、ルート URL ヘルパー、メール本文中の URL すべてが壊れます。
- `https://` で運用する場合は `APP_URL=https://...` にすること。

## 6. PHP バージョンと拡張モジュール

- 必須: PHP 8.3 系（最低 8.2）
- 必須拡張: `pdo_sqlite`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`,
  `bcmath`（推奨）, `fileinfo`, `gd`（任意）, `intl`（任意）

さくらコントロールパネルから PHP のバージョンを 8.3 に切り替え、`php.ini` で必要な拡張が
有効になっていることを確認します。

## 7. 本番で実行するコマンド

サーバーに SSH ログイン後、プロジェクトディレクトリで以下を実行します。

```
# 念のため最新化
composer install --no-dev --optimize-autoloader

# DB 初期化（初回のみ。SQLite）
mkdir -p database
touch database/database.sqlite
chmod 664 database/database.sqlite

# マイグレーション
php artisan migrate --force

# キャッシュ生成
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 念のため
php artisan optimize:clear
php artisan optimize
```

`storage/` と `bootstrap/cache/` の書き込み権限：

```
chmod -R 775 storage bootstrap/cache
```

## 8. storage / bootstrap/cache の注意

- これらに書き込めないと 500 エラーになります。
- 共有サーバーでは所有者と Web サーバーの実行ユーザが同一のことが多いため 0775 で十分。
  必要に応じて 0777 まで上げる（セキュリティと相談）。
- `storage/logs/laravel.log` は肥大化するため、定期的にローテーション設定するか手動で削除します。

## 9. デプロイ後チェックリスト

- [ ] `https://your-domain/gakudo` が表示される
- [ ] スマホ幅で崩れない
- [ ] 問い合わせフォーム送信で 200 が返り、`gakudo_lp_contacts` に保存される
- [ ] 管理者通知メールが届く
- [ ] `https://your-domain/admin/lp-settings` がログイン後に表示される
- [ ] `php artisan route:list` で `/gakudo`, `/admin/lp-settings` が出る
- [ ] `storage/logs/laravel.log` にエラーがない

## 10. ロールバック

- 万一トラブル時は、本番側 `vendor/`・`public/build/` を一つ前のリリースのバックアップに差し替えれば OK。
- DB マイグレーションを伴う変更は、必ず先にバックアップ（SQLite なら `cp database/database.sqlite database/database.sqlite.bak`）を取ってから実施すること。
