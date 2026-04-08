<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Data-fix migration: populate contract_id on invoices that were created
 * before the contract_id linkage was enforced (matching by booking_id).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            UPDATE invoices i
            INNER JOIN contracts c ON c.booking_id = i.booking_id
            SET i.contract_id = c.id
            WHERE i.contract_id IS NULL
              AND i.booking_id IS NOT NULL
        ");
    }

    public function down(): void
    {
        // Not reversible — we don't want to clear contract_id links
    }
};
