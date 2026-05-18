<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // create_job_postings_table
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->string('location')->nullable();
            $table->enum('job_type', ['full_time', 'part_time', 'contract', 'internship', 'remote'])->nullable();
            $table->string('salary_range')->nullable();

            // --- TAMBAHAN BARU UNTUK ATS ---
            $table->string('min_education')->nullable(); // Contoh: D3, S1
            $table->integer('min_experience')->nullable(); // Lama pengalaman dalam tahun (contoh: 1, 2)
            $table->integer('max_age')->nullable(); // Batas usia maksimal (contoh: 30)
            $table->string('work_model')->nullable();
            // -------------------------------

            $table->boolean('is_active')->default(true);
            $table->timestamp('deadline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
