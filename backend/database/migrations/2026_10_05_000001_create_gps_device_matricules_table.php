<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('gps_device_matricules', function (Blueprint $table) {
            $table->id();
            $table->string('provider_device_id', 100)->unique();
            $table->string('matricule', 30)->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gps_device_matricules');
    }
};