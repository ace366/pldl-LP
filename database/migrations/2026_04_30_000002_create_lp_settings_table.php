<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lp_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text');
            $table->string('group')->nullable();
            $table->string('label')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        $defaults = [
            ['key' => 'admin_notify_email',      'value' => 'no-reply@pldl.or.jp', 'type' => 'email',  'group' => 'notification', 'label' => '管理者通知メールアドレス',  'sort_order' => 10],
            ['key' => 'line_consult_url',        'value' => '',                    'type' => 'url',    'group' => 'cta',          'label' => 'LINE相談URL',              'sort_order' => 20],
            ['key' => 'intro_video_url',         'value' => '',                    'type' => 'url',    'group' => 'cta',          'label' => '3分紹介動画URL',           'sort_order' => 30],
            ['key' => 'document_request_url',    'value' => '',                    'type' => 'url',    'group' => 'cta',          'label' => '資料請求URL',              'sort_order' => 40],
            ['key' => 'ga_measurement_id',       'value' => '',                    'type' => 'text',   'group' => 'analytics',    'label' => 'Google Analytics ID',      'sort_order' => 50],
            ['key' => 'gsc_verification',        'value' => '',                    'type' => 'text',   'group' => 'analytics',    'label' => 'Search Console verification', 'sort_order' => 60],
            ['key' => 'fv_cta_text',             'value' => '無料デモを予約する',   'type' => 'text',   'group' => 'fv',           'label' => 'ファーストビューCTA文言',  'sort_order' => 70],
            ['key' => 'campaign_text',           'value' => '先着5施設：初期費用0円 + 導入サポート無料', 'type' => 'text', 'group' => 'campaign', 'label' => 'キャンペーン文言', 'sort_order' => 80],
            ['key' => 'show_initial_fee_zero',   'value' => '1',                   'type' => 'bool',   'group' => 'campaign',     'label' => '初期費用0円表示',          'sort_order' => 90],
            ['key' => 'show_support_free',       'value' => '1',                   'type' => 'bool',   'group' => 'campaign',     'label' => '導入サポート無料表示',     'sort_order' => 100],
            ['key' => 'reception_closed',        'value' => '0',                   'type' => 'bool',   'group' => 'reception',    'label' => '受付停止',                'sort_order' => 110],
            ['key' => 'reception_closed_message','value' => '誠に恐れ入りますが、現在新規のお問い合わせ受付を一時停止しております。再開までしばらくお待ちください。', 'type' => 'textarea', 'group' => 'reception', 'label' => '受付停止時メッセージ', 'sort_order' => 120],
        ];

        $now = now();
        foreach ($defaults as $row) {
            \DB::table('lp_settings')->insert(array_merge($row, [
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lp_settings');
    }
};
