<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tracer_study_responses', function (Blueprint $table) {
            $table->boolean('melanjutkan_pendidikan')->default(false)->after('status_pekerjaan');
            $table->string('pendidikan_institusi')->nullable()->after('melanjutkan_pendidikan');
        });

        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->boolean('melanjutkan_pendidikan')->default(false)->after('employment_status');
            $table->string('pendidikan_institusi')->nullable()->after('melanjutkan_pendidikan');
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn(['melanjutkan_pendidikan', 'pendidikan_institusi']);
        });

        Schema::table('tracer_study_responses', function (Blueprint $table) {
            $table->dropColumn(['melanjutkan_pendidikan', 'pendidikan_institusi']);
        });
    }
};
