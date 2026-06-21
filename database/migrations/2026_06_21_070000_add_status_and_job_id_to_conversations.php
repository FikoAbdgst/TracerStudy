<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->enum('status', ['open', 'closed'])->default('open')->after('type');
            $table->foreignId('job_posting_id')->nullable()->after('status')
                ->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['job_posting_id']);
            $table->dropColumn(['status', 'job_posting_id']);
        });
    }
};
