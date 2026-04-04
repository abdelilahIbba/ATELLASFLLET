<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The original fines migration defined `type` as an enum with 4 values.
 * The subsequent 2026-02-25 migration expanded the accepted values at the
 * application layer but never actually altered the column, causing the
 * SQLite CHECK constraint to reject the new types.
 *
 * This migration converts `type` to a plain VARCHAR(100) so that any
 * infraction type is accepted by the database; validation is enforced
 * by FineController at the application layer.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fines', function (Blueprint $table) {
            $table->string('type', 100)->change();
        });
    }

    public function down(): void
    {
        Schema::table('fines', function (Blueprint $table) {
            $table->enum('type', ['Radar', 'Parking', 'Speeding', 'Police Check'])->change();
        });
    }
};
