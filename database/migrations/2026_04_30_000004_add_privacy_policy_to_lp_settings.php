<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $now = now();
        $defaultPolicy = <<<'TXT'
NPO法人 Playful Learning Design Lab.（以下「当法人」）は、本フォームでお預かりする個人情報について、以下のとおり取り扱います。

1. 取得する情報
本フォームの送信に伴い、施設名・担当者名・メールアドレス・電話番号・児童数・希望内容・ご相談内容・送信元IPアドレス・ユーザーエージェント・流入元（UTMパラメータ）を取得します。

2. 利用目的
- お問い合わせへの回答・ご連絡
- 学童向け運営システムに関するご案内
- お問い合わせ対応の品質向上のための社内分析

3. 第三者提供
ご本人の同意がある場合、または法令に基づき開示を求められた場合を除き、お預かりした情報を第三者に提供することはありません。

4. 委託
お問い合わせ対応に必要な範囲で、メール配信・データ保管などの業務を外部のクラウドサービスへ委託することがあります。委託先には適切な監督を行います。

5. 安全管理措置
取得した情報は、漏えい・滅失・改ざんを防ぐため、適切な技術的・組織的安全管理措置を講じて取り扱います。

6. 保管期間
ご相談対応の完了から概ね2年を目安に、不要となった情報を削除します。法令上の保存義務がある場合はこの限りではありません。

7. 開示・訂正・削除等のご請求
ご本人からの開示・訂正・削除等のご請求があった場合、本人確認のうえ、合理的な期間内に対応いたします。下記窓口までご連絡ください。

8. お問い合わせ窓口
NPO法人 Playful Learning Design Lab.
support@top-ace-picard.sakura.ne.jp

最終改定日: 2026年4月30日
TXT;

        DB::table('lp_settings')->insert([
            'key'        => 'privacy_policy',
            'value'      => $defaultPolicy,
            'type'       => 'textarea',
            'group'      => 'legal',
            'label'      => 'プライバシーポリシー本文（同意チェックのモーダルに表示）',
            'sort_order' => 210,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        DB::table('lp_settings')->where('key', 'privacy_policy')->delete();
    }
};
