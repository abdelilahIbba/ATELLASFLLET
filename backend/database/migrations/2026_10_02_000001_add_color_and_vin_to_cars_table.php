<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            if (!Schema::hasColumn('cars', 'color')) {
                $table->string('color', 100)->nullable();
            }
            if (!Schema::hasColumn('cars', 'vin')) {
                $table->string('vin', 100)->nullable()->unique();
            }
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $columns = array_filter(
                ['color', 'vin'],
                fn ($column) => Schema::hasColumn('cars', $column)
            );
            if ($columns) {
                $table->dropColumn(array_values($columns));
            }
        });
    }
};