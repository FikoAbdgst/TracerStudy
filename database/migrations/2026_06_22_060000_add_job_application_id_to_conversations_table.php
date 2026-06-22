<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('job_application_id')
                ->nullable()
                ->after('job_posting_id')
                ->constrained('job_applications')
                ->nullOnDelete();

            $table->integer('rejected_reply_count')->default(0)->after('alumni_msg_count');
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['job_application_id']);
            $table->dropColumn('job_application_id');
            $table->dropColumn('rejected_reply_count');
        });
    }
};
