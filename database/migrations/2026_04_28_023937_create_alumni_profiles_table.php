<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alumni_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nim')->unique();

            // Kolom dari Admin Kampus (Excel)
            $table->string('jenjang_pendidikan')->nullable(); // D3 atau S1
            $table->string('major')->nullable();              // Program Studi
            $table->date('tanggal_lahir')->nullable();        // Format: YYYY-MM-DD
            $table->year('graduation_year')->nullable();      // Tahun Lulus

            // Kolom Lengkapi Profil (Dinamis dari Alumni)
            $table->string('phone_number')->nullable();
            $table->text('address')->nullable();              // Domisili Saat Ini
            $table->integer('experience')->default(0);           // Pengalaman Kerja
            $table->json('skills')->nullable();               // Disimpan sebagai array JSON
            $table->string('cv_path')->nullable();            // Dokumen CV

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumni_profiles');
    }
};
