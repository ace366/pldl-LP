# LP 裏側 設定項目一覧

LP 側の見た目・動作に影響する、管理画面（`/admin/lp-settings`）から変更できる設定の一覧です。
内部的には `lp_settings` テーブルで管理されています。

## 管理画面 URL

```
/admin/lp-settings
```

ログイン（Laravel Breeze）後にアクセス可能です。
初回はローカル / 本番ともに `/register` から管理ユーザーを作成してください。

## 設定一覧

| キー | 種別 | 表示ラベル | 用途 / 反映場所 |
|---|---|---|---|
| `admin_notify_email` | email | 管理者通知メールアドレス | 問い合わせ受信通知メール（`GakudoLpContactReceived`）の送信先 |
| `line_consult_url` | url | LINE相談URL | ファーストビュー / 受付停止時の代替連絡先リンク |
| `document_request_url` | url | 資料請求URL | 任意。CTAから別動線で誘導する場合に使用 |
| `ga_measurement_id` | text | Google Analytics ID | `G-XXXXXXXXXX` 形式。設定すると Blade で gtag が出力される |
| `gsc_verification` | text | Search Console verification | `<meta name="google-site-verification">` の値 |
| `fv_cta_text` | text | ファーストビューCTA文言 | Hero ボタン文言（既定: 「無料デモを予約する」） |
| `campaign_text` | text | キャンペーン文言 | Hero / Pricing で表示するキャンペーン用テキスト |
| `show_initial_fee_zero` | bool | 初期費用0円表示 | Pricing セクションのバッジ表示ON/OFF |
| `show_support_free` | bool | 導入サポート無料表示 | 同上 |
| `reception_closed` | bool | 受付停止 | ON にすると Contact フォームが受付停止メッセージに切り替わる |
| `reception_closed_message` | textarea | 受付停止時メッセージ | 上記 ON 時に表示されるメッセージ |

## メール受信設定

問い合わせ受信メールは `admin_notify_email` で設定したアドレスに送信されます。

- 値が空の場合、`config('mail.from.address')`（`MAIL_FROM_ADDRESS`）にフォールバックします。
- 本番では `.env` の `MAIL_*` を SMTP に設定してください。
- 送信失敗時はログに WARNING を記録し、フォーム送信自体は成功扱いになります（顧客体験を優先）。

## メールテンプレート

`resources/views/emails/gakudo-lp/contact-received.blade.php`

差し込まれる項目：

- 受付ID、施設名、担当者名、メール、電話番号、児童数
- 希望内容（コードを日本語ラベルに変換）
- ステータス、受付日時、相談内容
- UTM、IP、UserAgent

件名は `app/Mail/GakudoLpContactReceived.php` の `envelope()` で設定しています。
変更時は両方を確認してください。

## LINE / 動画 / 資料請求の差し替え方

1. `/admin/lp-settings` にログイン
2. 「CTA / 外部リンク」グループの URL を更新
3. 保存 → LP に即時反映（キャッシュは自動でクリアされます）

## アクセス解析

| 項目 | 設定 | 反映 |
|---|---|---|
| Google Analytics | `ga_measurement_id` に `G-XXXXXXXXXX` を設定 | LP の `<head>` に gtag が自動で挿入される |
| Search Console | `gsc_verification` にサイトオーナー確認用の content 値を設定 | `<meta name="google-site-verification">` が自動で出力される |

## 管理画面で変更できない項目

ブランディングや法人正式名称など、本質的に固定すべき内容は管理画面で編集できません。
変更が必要な場合はコード（`resources/js/components/lp/`）を直接編集して再ビルドします。

固定項目の例：

- ヘッダー・フッターのブランド表記（NPO法人 Playful Learning Design Lab.）
- 公式サイトリンク（`https://pldl.or.jp/`）
- 各セクションの本文テキスト
- 料金プランの内容

## 設定値のキャッシュについて

- `LpSetting::allCached()` が `Cache::remember(... 600s)` でキャッシュします。
- 管理画面から保存すると `flushCache()` が呼ばれ即時反映されます。
- 何らかの理由で反映されない場合は `php artisan cache:clear` を実行してください。
