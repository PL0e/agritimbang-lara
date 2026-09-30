<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('price_validation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('price_reference_id')->references('id')->on('price_references');
            $table->enum('from_status', ['draft', 'pending_review', 'official', 'rejected', 'archived'])->nullable();
            $table->enum('to_status', ['draft', 'pending_review', 'official', 'rejected', 'archived']);
            $table->string('action');
            $table->text('remarks')->nullable();
            $table->foreignUuid('performed_by')->references('id')->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_validation_logs');
    }
};
