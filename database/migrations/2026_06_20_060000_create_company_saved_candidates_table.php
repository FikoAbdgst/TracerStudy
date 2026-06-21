<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_saved_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('alumni_profile_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['company_id', 'alumni_profile_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_saved_candidates');
    }
};
