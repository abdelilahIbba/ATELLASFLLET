<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pickup_points', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address');
            $table->decimal('latitude',  10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('type', ['pickup', 'dropoff', 'both'])->default('both');
            $table->boolean('is_active')->default(true);
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_points');
    }
};
