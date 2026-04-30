<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::table('lp_settings')->where('key', 'intro_video_url')->delete();
    }

    public function down(): void
    {
        DB::table('lp_settings')->insert([
            'key'        => 'intro_video_url',
            'value'      => '',
            'type'       => 'url',
            'group'      => 'cta',
            'label'      => '3分紹介動画URL',
            'sort_order' => 30,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
