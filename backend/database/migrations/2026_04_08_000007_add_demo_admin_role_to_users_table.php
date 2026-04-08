<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Extend the role enum to include demo_admin
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','client','demo_admin') NOT NULL DEFAULT 'client'");
    }

    public function down(): void
    {
        // Revert: set any demo_admin users back to client first, then shrink enum
        DB::statement("UPDATE users SET role = 'client' WHERE role = 'demo_admin'");
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','client') NOT NULL DEFAULT 'client'");
    }
};
