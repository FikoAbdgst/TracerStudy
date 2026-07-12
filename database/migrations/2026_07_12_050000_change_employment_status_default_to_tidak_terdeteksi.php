<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('alumni_profiles')
            ->whereNull('employment_status')
            ->orWhere('employment_status', '')
            ->update(['employment_status' => 'Tidak Terdeteksi']);

        Schema::table('alumni_profiles', function ($table) {
            $table->string('employment_status')->default('Tidak Terdeteksi')->change();
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function ($table) {
            $table->string('employment_status')->nullable()->change();
        });
    }
};
