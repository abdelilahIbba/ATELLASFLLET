<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','client','demo_admin') NOT NULL DEFAULT 'client'");
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            // Laravel maps enum to varchar + CHECK on PostgreSQL.
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin','client','demo_admin'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'client'");
        }
    }

    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'client' WHERE role = 'demo_admin'");

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','client') NOT NULL DEFAULT 'client'");
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin','client'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'client'");
        }
    }
};
