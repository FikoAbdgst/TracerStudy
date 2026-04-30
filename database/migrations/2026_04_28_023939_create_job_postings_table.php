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
            $table->foreignId('company_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('title');
            $table->text('description');

            // 1. Tambahkan requirements
            $table->text('requirements')->nullable();

            $table->string('location')->nullable();

            // 2. Buat nullable sementara jika form belum mengirim jenis pekerjaan
            $table->enum('job_type', ['full_time', 'part_time', 'contract', 'internship', 'remote'])->nullable();

            $table->string('salary_range')->nullable();

            // 3. Ubah is_open menjadi is_active agar sesuai dengan frontend
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
