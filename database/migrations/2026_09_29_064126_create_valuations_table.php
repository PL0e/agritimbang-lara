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
        Schema::create('valuations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('livestock_id')->references('id')->on('livestock_records');
            $table->foreignUuid('price_reference_id')->references('id')->on('price_references');
            $table->foreignUuid('weight_estimation_id')->nullable()->references('id')->on('weight_estimations');
            $table->enum('weight_type', ['actual', 'estimated']);
            $table->decimal('weight_used_kg', 10, 2);
            $table->decimal('price_per_kg_used', 10, 2);
            $table->decimal('estimated_value', 12, 2);
            $table->foreignUuid('calculated_by')->references('id')->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('valuations');
    }
};
