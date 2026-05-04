<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('gakudo_lp_contacts', function (Blueprint $table) {
            $table->string('line_user_id', 64)->nullable()->after('plan');
        });
    }

    public function down(): void
    {
        Schema::table('gakudo_lp_contacts', function (Blueprint $table) {
            $table->dropColumn('line_user_id');
        });
    }
};
