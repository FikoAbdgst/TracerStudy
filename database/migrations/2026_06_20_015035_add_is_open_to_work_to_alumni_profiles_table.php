<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->boolean('is_open_to_work')->default(false)->after('skills');
        });

        DB::table('alumni_profiles')->whereNull('is_open_to_work')->update(['is_open_to_work' => false]);
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn('is_open_to_work');
        });
    }
};
