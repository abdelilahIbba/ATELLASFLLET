<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'cars',
        'bookings',
        'contracts',
        'invoices',
        'expenses',
        'fines',
        'maintenance_logs',
        'reviews',
        'blogs',
        'contacts',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->unsignedBigInteger('demo_account_id')->nullable()->after('id')->index();
                $t->foreign('demo_account_id')->references('id')->on('demo_accounts')->nullOnDelete();
            });
        }

        // Also store demo_account_id on the user so we can resolve it quickly
        Schema::table('users', function (Blueprint $t) {
            $t->unsignedBigInteger('demo_account_id')->nullable()->after('demo_expires_at')->index();
            $t->foreign('demo_account_id')->references('id')->on('demo_accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        foreach (array_merge($this->tables, ['users']) as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->dropForeign([$table === 'users' ? 'demo_account_id' : 'demo_account_id']);
                $t->dropColumn('demo_account_id');
            });
        }
    }
};
