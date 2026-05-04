# 変更履歴

このプロジェクトの変更履歴を記録します。
新しい変更は **先頭に追記** してください。形式：

```
## YYYY-MM-DD HH:MM JST  <commit-hash or "uncommitted">
- 変更内容（要点）
- 関連ファイル / ルート / DB変更
```

---

## 2026-05-04 (追補5)  スクロール連動アニメーションを追加

LPの各ブロック・写真がスクロールに合わせて順次フェードインするように改修。
一気に表示されず、ビューポートに入った要素から段階的に現れる。

### 仕組み

- `resources/js/lib/scrollReveal.ts` 新規: IntersectionObserver で `[data-reveal]`
  要素を監視し、ビューポートに入った時に `.is-inview` クラスを付与（一回限り、付与後は unobserve）
- CSS: `[data-reveal]` は初期状態で `opacity: 0; translate3d(0, 18px, 0)`、
  `.is-inview` で本来位置・透明度へ 0.7s のトランジション
- `data-reveal-delay="<ms>"` でカード stagger（80–520ms）
- `data-reveal-from="left|right|scale"` で出現方向のバリエーション
- `prefers-reduced-motion: reduce` ユーザーは即時表示（アニメ無効）
- 旧ブラウザで `IntersectionObserver` がない場合も即時表示で fallback
- `GakudoLp.tsx` の `useEffect` で初期化、unmount 時に observer.disconnect()

### 適用箇所

| セクション | パターン |
|---|---|
| Hero | ロゴ → サブ → バッジ → タイトル → サブコピー → 導入実績 → CTA を 80–520ms cascade。右側のスマホビジュアルは右からスライドイン |
| VideoSection | ヘッダ → 動画フレームをスケール、最後にフローキャプション |
| WhyGakudoor | ヘッダ後、4枚のカードを 0/100/200/300ms cascade |
| FieldIssues | 5項目を 80ms ずつ stagger |
| Solutions | 9機能カードを行内 80ms ずつ + 行ごと 60ms 累積 |
| AppScreens | 6スクリーンを 0/100/200ms（2行）でリピート |
| Capabilities | 4グループを 100ms cascade |
| AfterEffects | 4行を 80ms stagger |
| Differentiation | ヘッダ後、比較表全体をスケールイン |
| AdoptionRecord | ヘッダ後、採用団体カードをフェードイン |
| Pricing | 3プランを 0/120/240ms cascade |
| BrandBanner | ロゴをスケール、キャプションは遅延フェード |
| ContactForm | ヘッダ → フォームを段階表示 |

### 関連ファイル

```
追加: resources/js/lib/scrollReveal.ts
変更: resources/js/pages/GakudoLp.tsx                 (useEffect で初期化)
変更: resources/css/app.css                           ([data-reveal] ルール追加)
変更: resources/js/components/lp/Hero.tsx
変更: resources/js/components/lp/VideoSection.tsx
変更: resources/js/components/lp/WhyGakudoor.tsx
変更: resources/js/components/lp/FieldIssues.tsx
変更: resources/js/components/lp/Solutions.tsx
変更: resources/js/components/lp/AppScreens.tsx
変更: resources/js/components/lp/Capabilities.tsx
変更: resources/js/components/lp/AfterEffects.tsx
変更: resources/js/components/lp/Differentiation.tsx
変更: resources/js/components/lp/AdoptionRecord.tsx
変更: resources/js/components/lp/Pricing.tsx
変更: resources/js/components/lp/BrandBanner.tsx
変更: resources/js/components/lp/ContactForm.tsx
```

---

## 2026-05-04 (追補4)  紹介動画を YouTube → セルフホスト MP4 に差し替え

LPの紹介動画を YouTube 埋め込みから、提供された MP4 をセルフホストする形に変更。

### 動画圧縮

| 項目 | 元ファイル | 圧縮後 |
|---|---|---|
| 解像度 | 1920×1078 | 1280×720 |
| ビットレート | 4.5 Mbps | 96 kbps（コンテンツが静的なため） |
| サイズ | 230.95 MB | **10.5 MB**（95% 削減） |
| コーデック | H.264 + AAC | H.264 main + AAC 96kbps stereo |
| 拡張 | - | `+faststart`（moov atom 先頭配置でストリーミング再生） |

ffmpeg コマンド:

```
ffmpeg -i input.mp4 \
  -vf "scale=1280:-2" \
  -c:v libx264 -crf 26 -preset slow -profile:v main -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 2 \
  -movflags +faststart \
  output.mp4
```

### 主な変更

- `resources/js/components/lp/VideoSection.tsx`:
  - YouTube iframe (`youtube-nocookie.com/embed/RIZlv2AMvcw`) を削除
  - `<video controls preload="metadata" playsInline controlsList="nodownload">` の HTML5 video 要素に
  - `<source src={asset('/videos/gakudoor-intro.mp4')} type="video/mp4" />`
  - 見出しを「動画でわかる、Gakudoorの全体像。」に
  - フロー文言「無料トライアル」→「無料相談」
- `resources/css/app.css`:
  - `.lp-video__frame iframe` ルールに `, .lp-video__frame video` を追加
  - 黒背景 + `object-fit: contain` でアスペクト保持

### ファイル

```
追加: public/videos/gakudoor-intro.mp4   (10.5 MB)
変更: resources/js/components/lp/VideoSection.tsx
変更: resources/css/app.css
```

ffmpeg は本セッションで `winget install Gyan.FFmpeg`（v8.1）でインストール。

---

## 2026-05-04 (追補3)  パンフレットを Gakudoor リブランド版へ全面書き換え

LP のリブランドに合わせて A4 11ページのパンフレットを Gakudoor 三層構造へ全面リライト。
配色も LP と同じ青×ミント基調に統一（旧オレンジ/ネイビー基調は廃止）。

### 配色刷新

| 旧 | 新 |
|---|---|
| `--c-navy: #0d3b66` | `--c-navy: #1d4e8a` |
| `--c-blue: #1e6ec0` | `--c-blue: #2c6db5` |
| `--c-blue-2: #2a85d6` | `--c-blue-2: #5b9bd5` |
| `--c-orange: #ea7c25` | `--c-mint: #2c9590` |
| `--c-orange-2: #f08e3f` | `--c-mint-2: #5bc8c5` |
| `--c-orange-soft: #fff2e6` | `--c-mint-soft: #e0f6f5` |

LP の Gakudoor ブランドカラーと完全に揃え、印刷時の視認性も保ったやや深めのミント `#2c9590` を採用。

### ページ別変更

- **Page 1 / Cover**: PLDLマーク → Gakudoor ロゴ画像を配置。タイトルを「学童の連絡・出欠・お迎え管理を、スマホでやさしく一本化。」に。フッタを Service/Provider/Adoption の3行クレジット構造に
- **Page 3 / Solutions**: 「PLDLの仕組みでできること」 → 「Gakudoorでできること」
- **Page 4 / App Screens**: 「実際にPLDLが運用しているシステムのイメージ」 → 「Gakudoorの主要画面イメージ」
- **Page 6**: 旧「現場を知らないIT会社ではありません（PLDL紹介）」を **Gakudoorのこだわり + 導入実績PLDL様** ハイブリッドに作り変え。Why Gakudoor の 4 ポイントカード + 採用団体カードを同一ページに収容
- **Page 8 / Differentiation**: 比較表ヘッダ「PLDLの学童DX」 → 「Gakudoor」。「開発元: 教育現場を運営するNPO（PLDL）」 → 「開発・提供: 株式会社Rezon が開発・提供」、現場知見の行で「採用団体（NPO法人 PLDL）の運用実績を継続反映」に
- **Page 9 / Pricing**: 「先着5施設」案内文を Rezon 名義に
- **Page 10 / Flow**: ステップ4 のサポート言及を「株式会社Rezon へ直接ご相談」に
- **Page 11 / Closing**: closing 文言を Gakudoor ベースに。signature を Service/Provider/Adoption 三層構造 + Gakudoor ロゴ表示に
- **全ページフッタ**: `NPO法人 Playful Learning Design Lab.（PLDL）` → `Gakudoor / 株式会社Rezon` 表記に統一

### 関連ファイル

```
変更: docs/pamphlet.html                          (2007 → 1456 行 / 全面リライト)
変更: public/downloads/pldl-gakudo-pamphlet.pdf  (Chrome headless で再生成、2.24 MB)
```

PDF は Chrome のヘッドレスモードで HTML から自動生成。

```
"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --print-to-pdf="public/downloads/pldl-gakudo-pamphlet.pdf" --no-margins \
  "file:///C:/work/PLDL-LP/docs/pamphlet.html"
```

ファイル名 `pldl-gakudo-pamphlet.pdf` は `lp_settings.pamphlet_url` から参照されているのでそのまま維持。
将来的に `gakudoor-pamphlet.pdf` 等へリネームする場合は同設定も合わせて更新が必要。

---

## 2026-05-04 (追補2)  Header / Hero ブランドロゴのサイズ制限不具合を修正

`.lp-root img { max-width: 100%; height: auto }` のグローバルルール (specificity 0,1,1) が
`.lp-header__brand-logo` 等 (specificity 0,1,0) に勝っていたため、画像が natural width
(~1000px) まで膨張してヘッダーが画面いっぱいになる現象が発生。

セレクタを `img.lp-header__brand-logo` / `img.lp-hero__brand` / `img.lp-brand-banner__img`
に変更し specificity を揃え、ソース順で勝つよう修正。

---

## 2026-05-04 (追補)  追加ロゴ・現場写真・ブランドバナー4枚を配置

リブランド直後にユーザー追加提供のブランド画像を適材適所へ。

### 配置

| 画像 | ファイル名 | 配置先 | 役割 |
|---|---|---|---|
| 横長ロゴ（G + GAKUDOOR） | `public/images/gakudoor-logo-horizontal.png` | Header | 横並びロゴで Header 表示 |
| 縦ロゴ大（G + GAKUDOOR スタック） | `public/images/gakudoor-brand-stack.png` | Hero | メインビジュアルとして大きく表示 |
| 現場シーン写真（学童風景 + Gマーク） | `public/images/gakudoor-scene.png` | AdoptionRecord | 「実際に使われている」説得力を補強 |
| 横長ブランドバナー | `public/images/gakudoor-banner.png` | BrandBanner（新セクション） | Pricing → Contact 間にブランド再想起 |

### 主な変更
- `Header.tsx`: 個別 img+text → 横長ロゴ画像 1 枚 + サブタイトル「学童運営支援システム」（720px+ で表示）
- `Hero.tsx`: 小さい縦並びブランド表記 → 縦ロゴ画像（最大 320px）+ ガクドア｜学童運営支援システムの小キャプション
- `AdoptionRecord.tsx`: 採用団体カードに `<figure>` でシーン写真を上部に配置（200-260px の object-fit: cover）
- `BrandBanner.tsx` 新設: Pricing と ContactForm の間に挟むブランド再想起セクション。淡いラジアルグラデ背景 + 中央配置のロゴバナー + 1 行キャッチ
- CSS: `.lp-header__brand-logo` / `.lp-hero__brand` / `.lp-adoption__scene` / `.lp-brand-banner__*` を追加。旧 `.lp-header__brand-mark`, `.lp-hero__logo*` 関連のスタイルは削除

### 関連ファイル
```
追加: public/images/gakudoor-logo-horizontal.png
追加: public/images/gakudoor-brand-stack.png
追加: public/images/gakudoor-scene.png
追加: public/images/gakudoor-banner.png
追加: resources/js/components/lp/BrandBanner.tsx
変更: resources/js/components/lp/Header.tsx
変更: resources/js/components/lp/Hero.tsx
変更: resources/js/components/lp/AdoptionRecord.tsx
変更: resources/js/pages/GakudoLp.tsx
変更: resources/css/app.css
```

ビルド成果物 `GakudoLp-*.js` に 4 画像パスすべて埋め込まれていることを確認済み。
オリジナルの `gakudoor-logo.png`（小ロゴ）は OGP / favicon 用としてそのまま残置。

---

## 2026-05-04  LP リブランド: Gakudoor（ガクドア）として整理

学童システムを正式に「**Gakudoor（ガクドア）**」として位置付け、LP・OGP・メール・フッター・テーマ色を一括刷新。
PLDL は「導入実績」セクションのみで言及し、開発・提供は **株式会社Rezon** と明記する三層構造に整理。

### ブランド構造の整理（誤解防止）

| 役割 | 名称 |
|---|---|
| サービス名 | Gakudoor（ガクドア） |
| 開発・提供 | 株式会社Rezon |
| 導入実績（採用団体） | NPO法人 Playful Learning Design Lab.（PLDL）様 |

### 主な変更点

- **ロゴ追加**: `public/images/gakudoor-logo.png`（青グラデのドア型「G」+ ミントの笑顔）。Header / Hero / Footer / OGP / favicon で使用
- **テーマ色刷新**: 黄色基調 → **青 (#5b9bd5) × ミントグリーン (#5bc8c5)** 基調へ。`resources/css/app.css` の CSS 変数とハードコード黄色を一括置換
- **Header**: ブランド表示を「PLDL」 → ロゴ画像 + `Gakudoor / 学童運営支援システム` の縦並びに刷新。ナビは `Gakudoorとは / 現場課題 / 機能 / 導入実績 / 相談する`、CTA は `無料相談する`
- **Hero**: 見出し「学童の連絡・出欠・お迎え管理を、スマホでやさしく一本化。」サブコピーで Gakudoor の定義 + 「導入実績：PLDL様」ピル表示
- **WhyPldl → WhyGakudoor**: 「なぜPLDLか」セクションを「Why Gakudoor」に置換。PLDL を開発元として語る文言を全削除し、デザイン哲学（現場フィット / やさしいUI / 段階導入 / 採用団体運用実績で改善）に再構成
- **AdoptionRecord 新設**: 「導入実績」を独立セクションとして追加（Differentiation と Pricing の間）。PLDL 様のみ採用団体として丁寧に紹介
- **Differentiation**: 比較表の「開発元」行を `教育現場を運営するNPO（PLDL）` → `株式会社Rezon が開発・提供`、「現場知見」行で PLDL 様の運用実績に言及。表ヘッダ「PLDLの学童DX」 → 「Gakudoor」
- **AppScreens**: モック画面の URL バー `app.pldl.or.jp/...` → `app.gakudoor.jp/...` に変更。リード文も「Gakudoorの主要画面イメージ」に
- **ContactForm**: リード「PLDLの開発者本人がご対応します」 → 「株式会社Rezon が開発・提供する...」、送信後ノート「PLDLより24時間以内」 → 「株式会社Rezonより24時間以内」、見出しを「導入相談・資料請求」に
- **Footer**: PLDL 中心の構成 → サービス名 Gakudoor / 開発・提供 株式会社Rezon / 導入実績 PLDL様 の三層メタ情報構成へ全面書き換え
- **Blade (`gakudo-lp/index.blade.php`)**: title / description / OGP / favicon を Gakudoor 基準に
- **メール件名**: `【学童LP】...` → `【Gakudoor LP】...`
- **メール本文末尾の署名**: PLDL 名義 → サービス/開発/導入実績の三行に書き換え
- **セクション順**: AdoptionRecord を AfterEffects → Differentiation → **AdoptionRecord** → Pricing → Contact の位置に挿入

### 関連ファイル

```
追加: resources/js/components/lp/WhyGakudoor.tsx (旧 WhyPldl.tsx 置換)
追加: resources/js/components/lp/AdoptionRecord.tsx
追加: public/images/gakudoor-logo.png
変更: resources/css/app.css                              (パレット + 新セクション + Footer meta CSS)
変更: resources/js/pages/GakudoLp.tsx                    (import 差替 + 新セクション組み込み)
変更: resources/js/components/lp/Header.tsx
変更: resources/js/components/lp/Hero.tsx
変更: resources/js/components/lp/FieldIssues.tsx
変更: resources/js/components/lp/Solutions.tsx
変更: resources/js/components/lp/AppScreens.tsx
変更: resources/js/components/lp/Differentiation.tsx
変更: resources/js/components/lp/ContactForm.tsx
変更: resources/js/components/lp/Footer.tsx
変更: resources/views/gakudo-lp/index.blade.php
変更: resources/views/emails/gakudo-lp/contact-received.blade.php
変更: app/Mail/GakudoLpContactReceived.php
削除: resources/js/components/lp/WhyPldl.tsx
```

### 確認事項

- ルート (`/gakudo`, `/admin/lp-settings`, `POST /gakudo/contact`) はそのまま、URL 変更なし
- DB マイグレーション追加なし、`.env` 変更なし
- 商標について「商標登録済み」「商標確認済み」等の断定表現は **入れていない**（J-PlatPat 確認は別途）
- 既存 `lp_settings`（CTA文言・キャンペーン文・LINE URL等）はそのまま使用、フィールド追加削除なし

### ローカル確認手順

1. `npm run build`
2. `php artisan serve`
3. `http://127.0.0.1:8000/gakudo` を開く（APP_URL と一致するポートで）
4. Header ロゴ・Hero の導入実績ピル・Adoption セクション・Footer 三層表記を確認
5. PC + SP（DevTools のレスポンシブ）で崩れていないか確認

---

## 2026-05-03  営業ツール: CSV一括取り込み機能を追加

行政等が公開している施設一覧 CSV（学童保育実施施設一覧 等）を読み込んで、各施設の HP を Google Places で検索 → メール / 問い合わせフォームの有無を確認 → どちらか取れた施設だけ営業リストに追加する機能。

### 動作仕様
1. CSV を `name (名称) / address (所在地) / phone (電話番号)` 中心に取り込み（郵便番号 / 市町村 / 種別 / 公立・私営 もメモに反映）
2. 各行ごとに Places API (Text Search, pageSize=5) で `名称 + 所在地` を検索 → 電話一致を最優先で 1件選定
3. 候補が `websiteUrl` を持たない / 候補ゼロ → スキップ
4. HP を proxy.php で取得し、メール / 問い合わせフォーム URL を抽出
5. **どちらも検出できなければスキップ**（営業リストに追加しない）
6. メールあり、または フォームあり → 既存 `addItem()` で登録（重複は電話 or 名称一致で除外、優先度自動判定もそのまま）

### UI
- ツールバーに「📋 CSV一括取り込み」ボタンを追加
- モーダル: ファイル選択 / 処理間隔 (デフォ 300ms) / 進捗バー / KPI（処理・取込・スキップ・メール・フォーム）/ ローリングログ / 中断ボタン
- 中断時はその時点までの取り込みは保持

### 変更ファイル
- `public/sales-tool/index.html` — ボタン + CSV一括取り込みモーダル追加、`v=12` → `v=13`
- `public/sales-tool/assets/sales-tool.js` — RFC4180 風 CSV パーサ、`findPlaceForRow()`（電話一致優先）、`runCsvImport()` ループ、ハンドラ群追加
- `public/sales-tool/assets/sales-tool.css` — `.csv-help` `.csv-summary` `.csv-log` 等のスタイル追加

---

## 2026-05-03  料金プランからの申し込みをメールで識別できるように

料金表 (`Pricing`) の各カードの「このプランで相談する」ボタンから来た問い合わせを、通知メールで一目で見分けられるようにした。

### 流れ
1. Pricing カードの CTA → カスタムイベント `lp:select-plan` を発火（`light` / `standard` / `enterprise`）
2. ContactForm が同イベントを listen して `plan` を state に保持。希望内容が空なら `price` を自動セット
3. フォームに「選択中のプラン」バナーを表示（× で解除可）
4. POST 時に `plan` フィールドも送信 → DB に保存
5. 通知メール件名にプラン+価格タグを付与し、本文先頭にも `★ 料金プランからの申し込み` 行を追加

### 変更ファイル
- `database/migrations/2026_05_03_000001_add_plan_to_gakudo_lp_contacts.php` 新規 — `plan` (string, nullable) カラム追加
- `app/Models/GakudoLpContact.php` — fillable に `plan`、`planLabels()` / `planLabel()` 追加
- `resources/js/components/lp/Pricing.tsx` — CTA で `lp:select-plan` イベント発火
- `resources/js/components/lp/ContactForm.tsx` — イベント受信、バナー表示、`plan` を payload に追加
- `resources/css/app.css` — `.lp-plan-banner` 追加
- `app/Http/Controllers/GakudoLpContactController.php` — `Rule::in(['light','standard','enterprise'])` でバリデート
- `app/Mail/GakudoLpContactReceived.php` — 件名に `【スタンダード 29,800円〜】` 等のタグを動的挿入
- `resources/views/emails/gakudo-lp/contact-received.blade.php` — 本文に「★ 料金プランからの申し込み」と料金プラン行追加
- `resources/views/admin/contacts/show.blade.php` — 詳細画面にも料金プラン行追加

### 件名サンプル
- 通常: `【学童LP】無料デモ・資料請求のお問い合わせ`
- 料金カード経由: `【学童LP】【スタンダード 29,800円〜】無料デモ・資料請求のお問い合わせ`

---

## 2026-05-02  問い合わせフォーム 希望内容プルダウンを 3 択に整理

「資料がほしい」（資料DLは Hero の PDF ボタンに集約済み）を削除し、デモ／料金／相談の 3 択に絞る。`demo` と `consult` のラベル文言も意図がはっきりするよう書き換え。

### LP
- `resources/js/components/lp/ContactForm.tsx` purposes を `demo: 無料デモを予約したい` / `price: 料金を相談したい` / `consult: まずは相談したい` の 3 件に
- `app/Http/Controllers/GakudoLpContactController.php` `purpose` バリデーションを `Rule::in(['demo','price','consult'])` で縛る

### 表示マップ（後方互換のため `document` ラベル残置）
- `resources/views/emails/gakudo-lp/contact-received.blade.php` purposeMap 更新
- `app/Http/Controllers/Admin/GakudoLpContactsAdminController.php` purposeMap 更新

---

## 2026-05-02  紹介動画を `/gakudo` に YouTube 埋め込みで復活

完成した紹介動画 `https://youtu.be/RIZlv2AMvcw` を LP に組み込み。配置は元と同じく Hero と WhyPldl の間（自然な流れの位置）。

### LP
- `resources/js/components/lp/VideoSection.tsx` を新規作成。YouTube ID `RIZlv2AMvcw` を youtube-nocookie 経由で iframe 埋め込み（`rel=0`、`loading=lazy`、`strict-origin-when-cross-origin`）
- `resources/js/pages/GakudoLp.tsx` に `<VideoSection />` を Hero 直下に追加
- `app.css` に `.lp-video__frame`（16:9 アスペクト比のレスポンシブ iframe ラッパ、角丸 + 黒背景 + シャドウ）を追加
- 設定化はせず YouTube ID をコンポーネントにハードコード（前回の `intro_video_url` 設定削除を踏襲）

---

## 2026-04-30  「3分紹介動画」関連を一括削除（動画未完成のため）

動画コンテンツの完成が未定のため、関連する文言・UI・設定を全部位から削除。

### LP
- `resources/js/pages/GakudoLp.tsx` から `<VideoSection />` を取り外し
- `resources/js/components/lp/VideoSection.tsx` 自体を削除
- `Hero.tsx` の「3分紹介を見る」二次 CTA ボタンを削除、Hero 下のシーケンス案内を「15分デモ → 無料トライアル の順でご案内します。」に短縮

### 問い合わせ
- ContactForm の希望内容プルダウンから `'video' = 3分動画を見たい` を削除
- 通知メール (`emails/gakudo-lp/contact-received.blade.php`) の purpose ラベル表からも削除
- 管理画面詳細 (`Admin/GakudoLpContactsAdminController`) の purposeMap からも削除

### 設定
- マイグレーション `2026_04_30_000006_remove_intro_video_url_setting` で `lp_settings.intro_video_url` 行を削除
- Controller payload から `introVideoUrl` を除去、`LpSettings` 型 / 既定値からも除去
- `docs/SETTINGS.md` の対応行を削除

### 営業ツール
- `public/sales-tool/assets/sales-tool.js` の営業文テンプレから「3分の紹介動画または」を削り、「15分ほどのオンラインデモでご紹介可能です。」に短縮
- アセット cache-bust を `?v=5` に

---

## 2026-04-30  営業リストツールを public/ 配下に移して本番公開

`sales-tool/` ディレクトリを `public/sales-tool/` に移動。本番からも `https://top-ace-picard.sakura.ne.jp/pldl-lp/sales-tool/` で開けるようにした。

- `git mv sales-tool public/sales-tool` で履歴保持しつつ移動
- `deploy_pldl_lp_to_sakura.bat` の robocopy 除外から `sales-tool` を削除（`public/` ごと送られるので自然にデプロイ対象に入る）
- README を新パス・新URLに更新。「URL を知っていれば誰でも開ける」「データは localStorage 端末ローカル」などの注意事項を追記
- Laravel ルーティングや Controller は一切追加していない。`public/` 配下の静的ファイル配信としてのみ動く

---

## 2026-04-30  デプロイ bat に migrate / cache:clear を統合

新規マイグレーションを含むデプロイで「LP に新しい設定値が反映されない」事故が起きた。原因:
1. デプロイ → `optimize:clear` でキャッシュを一旦クリア
2. アクセスが入って Controller が `lp_settings.allCached()` を実行 → **マイグレーション実行前**の DB 状態をキャッシュに固める
3. その後 migrate → 新しい行が DB に入るが、cache 側は 10 分間旧値のまま

対策: `deploy_pldl_lp_to_sakura.bat` の Step [6/7] に `php artisan migrate --force` と `php artisan cache:clear` を追加し、すべてを 1 つの SSH 呼び出しに連結。これでアクセスが介在せず順序が保証される。

---

## 2026-04-30  パンフレット PDF + LP からダウンロード導線

### PDF
- `docs/pamphlet.html` を Chrome headless (`--print-to-pdf`) で `public/downloads/pldl-gakudo-pamphlet.pdf` に変換 (1.14MB / 11ページ A4)
- パンフレット側は `@page A4 portrait` / `print-color-adjust:exact` / `page-break-after:always` 等が組まれていたためそのまま通った
- 再生成は `tools/build-pamphlet-pdf.bat` を実行（Chrome 同梱パスから headless 起動）

### LP からの導線
- マイグレーション `2026_04_30_000005_add_pamphlet_url_to_lp_settings`: `lp_settings.pamphlet_url` (default `/downloads/pldl-gakudo-pamphlet.pdf`、group=cta) を追加
- Hero に「📄 資料をダウンロード（PDF）」ボタンを追加。`pamphlet_url` が空のときは非表示。`download` 属性 + `target="_blank"` で別タブ DL
- 管理画面「CTA / 外部リンク」セクションから URL 編集可能（外部の DL ホスティングに切替もできる）

---

## 2026-04-30  管理画面に問い合わせ一覧 / 詳細を追加

- 一覧 `/admin/contacts`: ステータスタブ（すべて / 新規 / 連絡済み / デモ予定 / 契約 / 失注）+ 検索（施設名・担当者名・メール・電話）+ 20件ページネーション。各行 pill でステータス可視化
- 詳細 `/admin/contacts/{id}`: 受信内容フル表示（UTM・IP・UA含む）+ ステータス/社内メモ/連絡日時/デモ予定日時/契約日時の編集フォーム
- `app.contacts` ルートグループ + `App\Http\Controllers\Admin\GakudoLpContactsAdminController`
- 共有レイアウト `resources/views/admin/layout.blade.php` を新設し、ヘッダーに「問い合わせ一覧 / LP設定」タブを追加。既存の lp-settings 画面も同レイアウトに移行（重複CSS整理）

---

## 2026-04-30  LP問い合わせフォーム拡張: プライバシーポリシーモーダル

同意チェック文言の「プライバシーポリシー」リンククリックでモーダル展開。閉じるのは ✕ ボタン / ESC / オーバーレイクリック / 「閉じる」ボタンのいずれか。

- マイグレーション `2026_04_30_000004_add_privacy_policy_to_lp_settings`: `lp_settings.privacy_policy` (textarea, group=legal) を追加。デフォルト本文は日本の個人情報保護法準拠のひな形（取得情報・利用目的・第三者提供・委託・安全管理・保管期間・開示請求・窓口）
- 管理画面 (`/admin/lp-settings`) に **「法務 / プライバシーポリシー」** グループとして自動表示、textarea で編集可能
- ContactForm.tsx にモーダル UI、`useEffect` で ESC キーと `body.overflow=hidden` 制御を組み込み

---

## 2026-04-30  LP問い合わせフォーム拡張: noindex / honeypot / rate limit

### noindex 制御（管理画面から ON/OFF）
- マイグレーション `2026_04_30_000003_add_seo_settings_to_lp_settings` で `lp_settings` に `noindex` (bool, group=seo) を追加
- LP Blade で `$lpSettings['noindex']` を見て `<meta name="robots" content="noindex,nofollow">` を出し分け
- 管理画面のグループラベル `seo` を追加して自動表示

### スパム対策
- **ハニーポット**: ContactForm.tsx に `position:absolute;left:-9999px` で隠した `name="website"` 入力を追加。`tabIndex={-1}` で tab 移動からも除外。bot が埋めたら `200 OK` を返しつつ DB 保存・通知を**スキップ**（ログに記録）
- **レート制限**: `/gakudo/contact` に `throttle:5,1` を追加（IP 単位、1分あたり5回まで）

ローカルでマイグレーション完了。

---

## 2026-04-30  問い合わせ通知メールの改行が消える件 / .bat の LF 起因事故

### 通知メールの改行問題
`GakudoLpContactReceived` の `Content` が `view:` で渡されており、HTML として送信されていたため、メールクライアントが改行を空白扱いして本文が一行に潰れていた。`text:` に切替してプレーンテキスト送信に修正。

### `.bat` の LF 改行で WPS Office が連続起動する事故
`deploy_pldl_lp_to_sakura.bat` を LF 改行で保存していたため、`cmd.exe` が各行先頭1〜2文字を脱落させて文字化けトークン (`tlocal`, `EM`, `t` 等) を生成→ファイル名と誤認識→**.bat 関連付けの WPS Office Spreadsheet が起動を繰り返す**事故が発生。

- 該当 .bat を CRLF に再保存
- `.gitattributes` に `*.bat / *.cmd text eol=crlf` を追加し再発防止

---

## 2026-04-30  本番 SMTP（さくら）動作確認 + テンプレ修正

`MAIL_USERNAME=no-reply@pldl.or.jp / pass=t366bbmh` で 535 認証失敗していた件、ユーザー確認の結果 **`t366bbmh` は `support@top-ace-picard.sakura.ne.jp` のパスワード**だった。

### 修正
- 本番 `.env`: `MAIL_USERNAME` と `MAIL_FROM_ADDRESS` を `support@top-ace-picard.sakura.ne.jp` に変更
- `docs/sakura-env.production.txt`: 同じく修正、Laravel 11 では `MAIL_ENCRYPTION` 不要 (`MAIL_SCHEME` を使う) コメントも追加
- 管理者通知先 `admin_notify_email` は env ではなく **DB (`lp_settings`) 管理**である旨をテンプレに明記

### 検証
- CLI: `Mail::raw(...)` で `support@top-ace-picard.sakura.ne.jp` 宛にテスト送信 → 例外なし
- HTTP: `POST /pldl-lp/gakudo/contact` を curl で実行 → `200 / {ok:true}`、DB に保存され通知メールが投げられる

---

## 2026-04-30  ローカル/本番の切り分けを自動化（再発防止）

ローカル ↔ 本番でハマる事故を減らすため、3 段で防御を入れた。

### 1. 環境ガード（自動判定）
`AppServiceProvider::boot()` が `APP_URL` のパス成分を見て、サブパス公開モード／単一オリジンモードを自動切替（`URL::forceRootUrl` と `URL::forceScheme('https')`）。`.env` のコピペで本番と取り違えても自動で安全側に倒れる。

### 2. デプロイ前後のスモークテスト
`deploy_pldl_lp_to_sakura.bat` を 6 ステップ → 8 ステップ ([0..7]) に拡張:
- **[0/7] Pre-deploy local smoke test** — `http://localhost:8000/{gakudo,register,login}` を curl して 200 か確認。失敗時は確認プロンプトで一時停止
- **[7/7] Post-deploy production smoke test** — `https://top-ace-picard.sakura.ne.jp/pldl-lp/{gakudo,register,login}` を curl して 200 か確認。失敗時はロールバック手順を表示
- ステップ [6] にサーバー側 `optimize:clear → config:cache → route:cache → view:cache` を統合（旧 bat は別途手動実行が必要だった）

### 3. .env.example のコメント整備
ローカル／本番の判定ルールを冒頭に明記。`docs/sakura-env.production.txt` も別途存在する旨を案内。

---

## 2026-04-30  ローカル `/register` が真っ白になる問題を修正

`AppServiceProvider::boot()` の `URL::forceRootUrl(config('app.url'))` をローカル (APP_URL=`http://127.0.0.1:8000`) でも無条件で効かせていたため、ブラウザを `http://localhost:8000` で開くと JS/CSS の `<script src>`/`<link href>` が `127.0.0.1:8000` を指してしまい **CORS で React がマウントされず blank** だった。

`APP_URL` にパス成分（サブパス）があるときだけ `forceRootUrl` を呼ぶよう変更。`https` スキームの強制も同じガードに統合。

---

## 2026-04-30  /register で 419 が出る問題を修正

### 真因
さくらレンタルサーバーは `Set-Cookie` ヘッダの cookie 名に `ENC_` プレフィックスを付け、値も独自暗号化する**透過プロキシ**を挟んでいる。
- レスポンス: `Set-Cookie: pldl_gakudo_lp_session=<laravel encrypted>` → ブラウザに届くのは `Set-Cookie: ENC_pldl_gakudo_lp_session=<sakura encrypted>`
- リクエスト: ブラウザが `Cookie: ENC_pldl_gakudo_lp_session=<sakura encrypted>` 送信 → さくらが復号して PHP の `$_COOKIE['pldl_gakudo_lp_session']` には Laravel の元の暗号化値が入る

サーバー側は透過なので影響なし。**問題は JS 側**で、`document.cookie` で見えるのは `ENC_XSRF-TOKEN=<sakura encrypted>` のみ。Inertia/Axios はデフォルトで `XSRF-TOKEN` cookie を読んで `X-XSRF-TOKEN` ヘッダで送るが、さくら暗号化された値は Laravel が復号できず CSRF 不一致 → **419**。

### 修正
1. `resources/views/app.blade.php` に `<meta name="csrf-token" content="{{ csrf_token() }}">` を追加
2. `resources/js/bootstrap.ts` で meta タグから生トークンを読み、`axios.defaults.headers.common['X-CSRF-TOKEN']` に設定。Cookie ベースの CSRF を完全に迂回。
3. `bootstrap/app.php` で `trustProxies(at: '*')` も併せて設定（scheme 判定の信頼性確保）。

## 2026-04-30  /register などサブパス公開対応 + Laravel ロゴ撤去

### サブパスリダイレクト対応
`AppServiceProvider::boot()` で `URL::forceRootUrl(config('app.url'))` を仕込み、`https` の場合は `URL::forceScheme('https')` も設定。これで `redirect('/dashboard')` 等が `https://top-ace-picard.sakura.ne.jp/pldl-lp/dashboard` を正しく組み立てる（従来は `/pldl-lp` プレフィックスを失っていた）。

`/pldl-lp/register` 経由でユーザー登録 → ダッシュボード遷移が正しく動くようになる。

### Laravel ロゴ撤去
- `resources/js/layouts/GuestLayout.tsx` の `<ApplicationLogo>` を削除（login/register/forgot-password 画面）
- `resources/js/layouts/AuthenticatedLayout.tsx` のロゴを SVG → "PLDL" テキストに置換（dashboard ナビゲーション）

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
