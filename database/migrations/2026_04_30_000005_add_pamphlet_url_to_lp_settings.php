<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::table('lp_settings')->insert([
            'key'        => 'pamphlet_url',
            'value'      => '/downloads/pldl-gakudo-pamphlet.pdf',
            'type'       => 'text',
            'group'      => 'cta',
            'label'      => 'パンフレット PDF URL（空にすると LP のダウンロードボタン非表示）',
            'sort_order' => 45,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('lp_settings')->where('key', 'pamphlet_url')->delete();
    }
};
