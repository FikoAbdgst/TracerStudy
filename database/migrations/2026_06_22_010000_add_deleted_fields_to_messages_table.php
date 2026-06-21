<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (! Schema::hasColumn('messages', 'deleted_by')) {
                $table->json('deleted_by')->nullable()->after('is_read');
            }
            if (! Schema::hasColumn('messages', 'is_deleted_for_everyone')) {
                $table->boolean('is_deleted_for_everyone')->default(false)->after('deleted_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'deleted_by')) {
                $table->dropColumn('deleted_by');
            }
            if (Schema::hasColumn('messages', 'is_deleted_for_everyone')) {
                $table->dropColumn('is_deleted_for_everyone');
            }
        });
    }
};
