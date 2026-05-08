<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('master_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Contoh: "Program Studi"
            $table->string('slug')->unique(); // Contoh: "program-studi"
            $table->boolean('use_parameter')->default(false); // Apakah butuh kolom ke-2?
            $table->string('parameter_label')->nullable(); // Contoh: "Jenjang"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_categories');
    }
};
