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
            $table->foreignId('job_posting_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('alumni_id')
                ->constrained('alumni_profiles')
                ->cascadeOnDelete();
            $table->string('cv_url');
            $table->enum('status', ['pending', 'reviewed', 'accepted', 'rejected'])
                ->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('applied_at')->useCurrent();
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
