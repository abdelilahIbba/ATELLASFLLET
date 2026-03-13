<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add payment_status column to bookings table
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('payment_status', ['Paid', 'Deposit Only', 'Unpaid'])
                ->default('Unpaid')->after('status');
            $table->text('notes')->nullable()->after('payment_status');
        });

        // Extend the status enum to include active and completed
        // MODIFY COLUMN is MySQL-only; SQLite (used in tests) stores as TEXT so no change needed
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM(
                'pending','confirmed','active','completed','cancelled'
            ) NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'notes']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM(
                'pending','confirmed','cancelled'
            ) NOT NULL DEFAULT 'pending'");
        }
    }
};
