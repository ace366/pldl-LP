# プロジェクト開発ルール

> **このファイルは、変更・修正の前に必ず参照してください。**
> ルールに反する変更は受け付けません。

## 1. 法人・ブランド表記

- 正式名称: **NPO法人 Playful Learning Design Lab.**
- 初出表記: `NPO法人 Playful Learning Design Lab.（PLDL）`
- 以降の文中で `PLDL` 単独表記は可。
- **「PLDL学童」「PLDL塾」など、組み合わせ略称は禁止。**
- 公式サイト: https://pldl.or.jp/
- LPのトーン: 誠実・知的・温かみ・教育的・信頼感重視。売り込み感は禁止。

LPの「Why」「Footer」「運営団体」セクションには公式サイトリンクを必ず維持すること。

## 2. リポジトリ運用

- 作業の節目ごとに必ず commit / push。
- ブランチを切る場合も、main / master へのマージ前に PR を必ず通す。
- `git push` が失敗した場合、自己判断で破壊的操作（`reset --hard`, `push --force`）を行わない。
- 環境設定の変更（`.env`, `php.ini`, `package.json` の依存追加等）は別 commit にし、commit message で明示する。

## 3. 環境変数

- `.env` は **絶対に Git にコミットしない**。
- 設定値の追加・変更は `.env.example` にも必ず反映する。
- `APP_KEY` をリセットする操作は本番では行わない（既存セッション・暗号化済みデータが破棄される）。

## 4. ビルド方針

- **さくらレンタルサーバー側で `npm run build` を実行しない。**
- ローカルで `npm run build` → `public/build/` を含めてサーバーへアップロードする。
- `composer install` は本番側で `--no-dev --optimize-autoloader` を付けて実行する。
- TypeScript 型チェック（`tsc`）は `npm run build` 内で動くため、ビルドが通る = 型エラーなしの状態。

## 5. データベース

- 初期は **SQLite**（`database/database.sqlite`）。
- MySQL に切り替える場合は `.env` を変更し、`php artisan migrate` を必ず実行する。
- マイグレーションは追加のみ（既存マイグレーションファイルの編集禁止）。

## 6. 機能変更時のルール

1. **まず `docs/*.md` を確認し、関連する設計を把握する。**
2. 変更が必要なら、対応する md（PROJECT_RULES.md / DEPLOY_SAKURA.md / SETTINGS.md / CHANGELOG.md）を更新する。
3. 実装する。
4. ローカルで動作確認する：
   - `php artisan migrate` が通る
   - `npm run build` が通る
   - `php artisan route:list` で対象ルートが存在する
   - `/gakudo` がスマホ・PCで崩れない
   - フォーム送信で `gakudo_lp_contacts` に保存される
   - 管理画面で設定変更ができる
5. `docs/CHANGELOG.md` に変更を追記する。
6. commit & push する。

## 7. 個人情報・セキュリティ

- 問い合わせ内容（`gakudo_lp_contacts`）には個人情報が含まれる。Git には DB ファイル自体は含めない（`.gitignore` 設定済み）。
- ログにも問い合わせ内容を不必要に出力しない。
- メール送信は本番では SMTP（さくらメール または外部 SMTP）を使用すること。`MAIL_MAILER=log` のまま本番運用しない。

## 8. UIルール

- スマホファースト。基準は 375px 幅。
- PC は最大幅 1120px（`.lp-container`）程度で見やすく。
- LP のスタイルは `resources/css/app.css` 内の `.lp-root` 配下にスコープして書く。Breeze 管理画面の Tailwind と衝突させない。

## 9. 禁止事項

- `php artisan migrate:fresh` を本番で実行しない（DB ぶっ飛ぶ）。
- `--no-verify` で hook をスキップしてコミットしない。
- 不必要な依存追加（`composer require` / `npm install <pkg>`）はしない。
- README / docs を更新せずに新機能を追加しない。
