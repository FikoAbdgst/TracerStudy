<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('employment_status');
        });

        Schema::table('tracer_study_responses', function (Blueprint $table) {
            $table->string('status_pekerjaan')->nullable()->after('answers');
            $table->string('nama_perusahaan')->nullable()->after('status_pekerjaan');
            $table->string('kesesuaian_bidang')->nullable()->after('nama_perusahaan');
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn('company_name');
        });

        Schema::table('tracer_study_responses', function (Blueprint $table) {
            $table->dropColumn(['status_pekerjaan', 'nama_perusahaan', 'kesesuaian_bidang']);
        });
    }
};
