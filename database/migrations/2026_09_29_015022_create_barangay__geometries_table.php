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
        Schema::create('barangay_geometries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid("barangay_id")->unique()->references('id')->on('barangays');
            $table->json('geometry');
            $table->string('geometry_type');
            $table->string('source')->nullable();
            $table->text('source_reference')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barangay_geometries');
    }
};
