<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('gakudo_lp_contacts', function (Blueprint $table) {
            $table->id();
            $table->string('facility', 100);
            $table->string('name', 100);
            $table->string('email');
            $table->string('tel', 30)->nullable();
            $table->unsignedInteger('children_count')->nullable();
            $table->string('purpose', 50)->nullable();
            $table->text('message')->nullable();
            $table->string('status', 30)->default('new');
            $table->text('internal_memo')->nullable();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('demo_scheduled_at')->nullable();
            $table->timestamp('contracted_at')->nullable();
            $table->string('source', 50)->default('lp');
            $table->string('utm_source', 100)->nullable();
            $table->string('utm_medium', 100)->nullable();
            $table->string('utm_campaign', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['email', 'created_at']);
            $table->index(['facility', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gakudo_lp_contacts');
    }
};
