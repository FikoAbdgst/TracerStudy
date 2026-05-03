<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // create_tracer_study_responses_table
    public function up(): void
    {
        Schema::create('tracer_study_responses', function (Blueprint $table) {
            $table->id();
            // Relasi ke kuesioner
            $table->foreignId('tracer_study_form_id')->constrained()->cascadeOnDelete();
            // Relasi ke alumni
            $table->foreignId('alumni_id')->constrained('alumni_profiles')->cascadeOnDelete();
            // Menyimpan jawaban kuesioner dalam format JSON
            $table->json('answers');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tracer_study_responses');
    }
};
