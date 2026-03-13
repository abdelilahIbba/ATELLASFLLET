<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            // JSON array of per-unit license plates: ["72819-A-1", "72820-A-1", "72821-A-1"]
            // Index i (0-based) corresponds to unit_number i+1 (1-based)
            $table->json('unit_plates')->nullable()->after('plate');
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn('unit_plates');
        });
    }
};
