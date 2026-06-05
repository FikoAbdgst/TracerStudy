<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Convert existing single-string paths to JSON arrays
        $this->convertExistingData('forum_topics');
        $this->convertExistingData('forum_replies');

        // Change column type to text
        Schema::table('forum_topics', function (Blueprint $table) {
            $table->text('attachment')->nullable()->change();
        });
        Schema::table('forum_replies', function (Blueprint $table) {
            $table->text('attachment')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Restore first value from JSON array back to single string
        $this->revertData('forum_topics');
        $this->revertData('forum_replies');

        Schema::table('forum_topics', function (Blueprint $table) {
            $table->string('attachment')->nullable()->change();
        });
        Schema::table('forum_replies', function (Blueprint $table) {
            $table->string('attachment')->nullable()->change();
        });
    }

    private function convertExistingData(string $table): void
    {
        $rows = DB::table($table)->whereNotNull('attachment')->get();
        foreach ($rows as $row) {
            $value = $row->attachment;
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                continue;
            }
            DB::table($table)
                ->where('id', $row->id)
                ->update(['attachment' => json_encode([$value])]);
        }
    }

    private function revertData(string $table): void
    {
        $rows = DB::table($table)->whereNotNull('attachment')->get();
        foreach ($rows as $row) {
            $paths = json_decode($row->attachment, true);
            if (is_array($paths) && count($paths) > 0) {
                DB::table($table)
                    ->where('id', $row->id)
                    ->update(['attachment' => $paths[0]]);
            }
        }
    }
};
