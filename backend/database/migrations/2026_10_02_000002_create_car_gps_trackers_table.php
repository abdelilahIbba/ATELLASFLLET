<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('car_gps_trackers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('unit_number');
            $table->string('provider_device_id', 100)->unique();
            $table->string('tracker_key', 128)->unique();
            $table->string('provider_name')->nullable();
            $table->timestamps();

            $table->unique(['car_id', 'unit_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('car_gps_trackers');
    }
};