<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (! Schema::hasColumn('conversations', 'alumni_msg_count')) {
                $table->unsignedTinyInteger('alumni_msg_count')->default(0)->after('job_posting_id');
            }
            if (! Schema::hasColumn('conversations', 'hr_replied')) {
                $table->boolean('hr_replied')->default(false)->after('alumni_msg_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (Schema::hasColumn('conversations', 'alumni_msg_count')) {
                $table->dropColumn('alumni_msg_count');
            }
            if (Schema::hasColumn('conversations', 'hr_replied')) {
                $table->dropColumn('hr_replied');
            }
        });
    }
};
