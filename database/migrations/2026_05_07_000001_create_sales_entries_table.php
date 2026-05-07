<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_entries', function (Blueprint $table) {
            $table->id();

            // 全ユーザー共有（user_id は持たない）。
            // 「誰が触ったか」を追いたくなったら updated_by_user_id を後付けする。
            $table->string('facility', 100);
            $table->string('prefecture', 20)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('address', 200)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('website_url', 500)->nullable();
            $table->string('contact_form_url', 500)->nullable();
            $table->string('gmap_url', 500)->nullable();
            $table->string('type', 30)->nullable();
            $table->char('priority', 1)->nullable(); // S / A / B / C
            $table->string('status', 20)->nullable();
            $table->text('memo')->nullable();
            $table->date('first_sent_at')->nullable();
            $table->date('next_action_at')->nullable();

            // サイト解析結果（skillLevel など、JS が抽出した自由形式 JSON）。
            $table->json('analysis')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('priority');
            $table->index('status');
            $table->index('next_action_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_entries');
    }
};
