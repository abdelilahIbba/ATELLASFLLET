<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->boolean('gps_visible')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('cars', fn (Blueprint $table) => $table->dropColumn('gps_visible'));
    }
};