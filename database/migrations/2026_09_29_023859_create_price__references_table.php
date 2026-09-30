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
        Schema::create('price_references', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('municipality_id')->references('id')->on('municipalities');
            $table->foreignUuid('barangay_id')->nullable()->references('id')->on('barangays');
            $table->foreignUuid('species_id')->references('id')->on('species');
            $table->foreignUuid('breed_id')->nullable()->references('id')->on('breeds');
            $table->decimal('price_per_kg', 10, 2);
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->string('source');
            $table->text('remarks')->nullable();
            $table->enum('status', ['draft', 'pending_review', 'official', 'rejected', 'archived'])->default('draft');
            $table->foreignUuid('submitted_by')->references('id')->on('users');
            $table->dateTime('submitted_at')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->references('id')->on('users');
            $table->dateTime('reviewed_at')->nullable();
            $table->foreignUuid('approved_by')->nullable()->references('id')->on('users');
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_references');
    }
};
