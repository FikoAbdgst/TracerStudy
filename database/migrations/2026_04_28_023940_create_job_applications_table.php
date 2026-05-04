<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // create_job_applications_table
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel job_postings dan alumni_profiles
            $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('alumni_id')->constrained('alumni_profiles')->cascadeOnDelete();

            // Kolom untuk menyimpan file CV, status, dan catatan HRD
            $table->string('cv_path');
            $table->string('status')->default('pending'); // pending, direview, wawancara, diterima, ditolak
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
