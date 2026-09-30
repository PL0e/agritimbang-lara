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
        Schema::create('weight_estimations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('livestock_id')->references('id')->on('livestock_records');
            $table->decimal('chest_girth_cm', 10, 2);
            $table->decimal('body_length_cm', 10, 2);
            $table->enum('body_frame', ['1', '3', '5'])->nullable();
            $table->decimal('estimated_weight_kg', 10, 2);
            $table->string('formula_version')->nullable();
            $table->foreignUuid('calculated_by')->references('id')->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weight_estimations');
    }
};
