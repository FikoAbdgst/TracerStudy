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
            $table->foreignId('form_id')
                ->constrained('tracer_study_forms')
                ->cascadeOnDelete();
            $table->foreignId('alumni_id')
                ->constrained('alumni_profiles')
                ->cascadeOnDelete();
            $table->json('answers');
            $table->timestamp('submitted_at')->useCurrent();
            $table->unique(['form_id', 'alumni_id']);
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
