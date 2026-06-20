<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('alumni_profiles', 'employment_status')) {
            Schema::table('alumni_profiles', function ($table) {
                $table->string('employment_status')->nullable()->after('is_open_to_work');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('alumni_profiles', 'employment_status')) {
            Schema::table('alumni_profiles', function ($table) {
                $table->dropColumn('employment_status');
            });
        }
    }
};
