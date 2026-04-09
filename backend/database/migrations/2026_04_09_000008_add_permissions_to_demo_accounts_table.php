<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demo_accounts', function (Blueprint $table) {
            // JSON array of allowed admin tab IDs, e.g. ["overview","fleet","bookings"]
            $table->json('permissions')->nullable()->after('access_key');
        });

        Schema::table('users', function (Blueprint $table) {
            // Copied from demo_accounts.permissions when a demo user is created/updated
            $table->json('demo_permissions')->nullable()->after('role');
            // Track when this demo user's trial expires (for display at login)
            $table->date('demo_expires_at')->nullable()->after('demo_permissions');
        });
    }

    public function down(): void
    {
        Schema::table('demo_accounts', function (Blueprint $table) {
            $table->dropColumn('permissions');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['demo_permissions', 'demo_expires_at']);
        });
    }
};
