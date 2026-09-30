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
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('transaction_id')->references('id')->on('transactions');
            $table->foreignUuid('livestock_id')->references('id')->on('livestock_records');
            $table->foreignUuid('valuation_id')->references('id')->on('valuations');
            $table->decimal('weight_used_kg', 10, 2);
            $table->decimal('price_per_kg_used', 10, 2);
            $table->decimal('reference_value', 12, 2);
            $table->decimal('actual_selling_price', 12, 2);
            $table->decimal('price_difference', 12, 2)->nullable();
            $table->decimal('percentage_deviation', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};
