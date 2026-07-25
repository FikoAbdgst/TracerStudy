<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tracer_study_forms', function (Blueprint $table) {
            $table->string('status')->default('draft')->after('questions');
        });

        DB::table('tracer_study_forms')->where('is_active', true)->update(['status' => 'active']);
        DB::table('tracer_study_forms')->where('is_active', false)->update(['status' => 'closed']);

        Schema::table('tracer_study_forms', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('tracer_study_forms', function (Blueprint $table) {
            $table->boolean('is_active')->default(false)->after('questions');
        });

        DB::table('tracer_study_forms')->where('status', 'active')->update(['is_active' => true]);
        DB::table('tracer_study_forms')->where('status', '!=', 'active')->update(['is_active' => false]);

        Schema::table('tracer_study_forms', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
