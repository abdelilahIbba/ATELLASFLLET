<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Rename 'discount' → 'discount_amount' if the old name exists
            if (Schema::hasColumn('invoices', 'discount') && !Schema::hasColumn('invoices', 'discount_amount')) {
                $table->renameColumn('discount', 'discount_amount');
            }

            // Add issue_date if missing
            if (!Schema::hasColumn('invoices', 'issue_date')) {
                $table->date('issue_date')->nullable()->after('due_date');
            }

            // Add currency if missing
            if (!Schema::hasColumn('invoices', 'currency')) {
                $table->string('currency', 10)->nullable()->default('MAD')->after('total');
            }
        });

        // invoices.status is created as string in this codebase; MySQL-only enum change is optional.
        if (DB::getDriverName() === 'mysql') {
            DB::statement(
                "ALTER TABLE invoices MODIFY COLUMN status ENUM('draft','sent','pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending'"
            );
        }
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            if (Schema::hasColumn('invoices', 'discount_amount') && !Schema::hasColumn('invoices', 'discount')) {
                $table->renameColumn('discount_amount', 'discount');
            }
            if (Schema::hasColumn('invoices', 'issue_date')) {
                $table->dropColumn('issue_date');
            }
            if (Schema::hasColumn('invoices', 'currency')) {
                $table->dropColumn('currency');
            }
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement(
                "ALTER TABLE invoices MODIFY COLUMN status ENUM('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending'"
            );
        }
    }
};
