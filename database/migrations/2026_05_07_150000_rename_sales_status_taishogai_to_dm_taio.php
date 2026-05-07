<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * `sales_entries.status` の旧値「対象外」を新値「DM対応」に置換する。
     * 「対象外」だった営業先を DM 送付対象として再活用する運用変更に伴うリネーム。
     * status カラム自体はもともと自由文字列 (`nullable, string, max:20`) なので、
     * カラム定義変更は不要、データの値だけ書き換えれば良い。
     *
     * 本番 (2026-05-07 時点) は sales_entries 0 行のため実質 no-op だが、
     * 将来データが入った状態で適用される可能性があるため migration として
     * 残しておく。
     */
    public function up(): void
    {
        DB::table('sales_entries')
            ->where('status', '対象外')
            ->update(['status' => 'DM対応']);
    }

    /**
     * 戻す側。実運用では戻さない想定だが書いておく。
     */
    public function down(): void
    {
        DB::table('sales_entries')
            ->where('status', 'DM対応')
            ->update(['status' => '対象外']);
    }
};
