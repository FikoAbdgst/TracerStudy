<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->boolean('privacy_hide_phone')->default(false)->after('photo_path');
            $table->boolean('privacy_hide_address')->default(false)->after('privacy_hide_phone');
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn(['privacy_hide_phone', 'privacy_hide_address']);
        });
    }
};
