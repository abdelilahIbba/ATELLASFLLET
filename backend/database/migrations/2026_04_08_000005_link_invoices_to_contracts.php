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
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("
                UPDATE invoices AS i
                SET contract_id = c.id
                FROM contracts AS c
                WHERE c.booking_id = i.booking_id
                  AND i.contract_id IS NULL
                  AND i.booking_id IS NOT NULL
            ");

            return;
        }

        if ($driver === 'sqlite') {
            // SQLite: UPDATE ... FROM (supported since 3.33) or correlated subquery
            DB::statement("
                UPDATE invoices
                SET contract_id = (
                    SELECT c.id FROM contracts c
                    WHERE c.booking_id = invoices.booking_id
                    LIMIT 1
                )
                WHERE contract_id IS NULL
                  AND booking_id IS NOT NULL
                  AND EXISTS (
                    SELECT 1 FROM contracts c2
                    WHERE c2.booking_id = invoices.booking_id
                  )
            ");

            return;
        }

        // MySQL / MariaDB syntax
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
