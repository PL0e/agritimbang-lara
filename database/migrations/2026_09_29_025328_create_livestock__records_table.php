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
        Schema::create('livestock_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('farmer_id')->references('id')->on('farmer_profiles');
            $table->foreignUuid('species_id')->references('id')->on('species');
            $table->foreignUuid('breed_id')->nullable()->references('id')->on('breeds');
            $table->enum('sex', ['male', 'female', 'unknown'])->nullable();
            $table->decimal('age', 10, 2)->nullable();
            $table->string('classification')->nullable();
            $table->string('condition');
            $table->decimal('actual_weight_kg', 10, 2)->nullable();
            $table->foreignUuid('municipality_id')->references('id')->on('municipalities');
            $table->foreignUuid('barangay_id')->references('id')->on('barangays');
            $table->enum('status', ['available', 'in_transaction', 'sold', 'archived']);
            $table->foreignUuid('created_by')->references('id')->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livestock_records');
    }
};
