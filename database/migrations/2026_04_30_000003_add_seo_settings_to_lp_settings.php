<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $now = now();

        DB::table('lp_settings')->insert([
            [
                'key'        => 'noindex',
                'value'      => '0',
                'type'       => 'bool',
                'group'      => 'seo',
                'label'      => '検索エンジンでインデックスさせない (noindex,nofollow)',
                'sort_order' => 200,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('lp_settings')->where('key', 'noindex')->delete();
    }
};
