<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('messages', 'deleted_by') && DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE messages ALTER COLUMN deleted_by TYPE JSONB USING deleted_by::jsonb');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('messages', 'deleted_by') && DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE messages ALTER COLUMN deleted_by TYPE JSON USING deleted_by::json');
        }
    }
};
