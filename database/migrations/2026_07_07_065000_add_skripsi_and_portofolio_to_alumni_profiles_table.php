<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->string('judul_skripsi')->nullable()->after('graduation_year');
            $table->json('portofolio_proyek')->nullable()->after('judul_skripsi');
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn(['judul_skripsi', 'portofolio_proyek']);
        });
    }
};
