<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // create_alumni_profiles_table
    public function up(): void
    {
        Schema::create('alumni_profiles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('nim')->unique();
            $table->string('angkatan', 4);
            $table->string('prodi');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('current_job')->nullable();
            $table->string('current_company')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('photo_url')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumni_profiles');
    }
};
