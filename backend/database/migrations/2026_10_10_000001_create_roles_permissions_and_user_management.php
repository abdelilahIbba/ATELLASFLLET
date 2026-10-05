<?php

use App\Support\PermissionCatalog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_protected')->default(false);
            $table->boolean('admin_access')->default(false);
            $table->boolean('website_access')->default(true);
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('key', 120)->unique();
            $table->string('scope', 20);
            $table->string('page', 60);
            $table->string('action', 20);
            $table->string('label')->nullable();
            $table->timestamps();
        });

        Schema::create('role_permission', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'permission_id']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 80)->index();
            $table->string('target_type', 80)->nullable();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->json('meta')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();
            $table->index(['target_type', 'target_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('role')->constrained('roles')->nullOnDelete();
            $table->string('user_type', 20)->default('client')->after('role_id')->index();
            $table->boolean('is_active')->default(true)->after('user_type');
        });

        PermissionCatalog::sync();

        $roles = DB::table('roles')->pluck('id', 'slug');
        DB::table('users')->where('role', 'admin')->update(['role_id' => $roles['super-admin'], 'user_type' => 'staff']);
        DB::table('users')->where('role', 'demo_admin')->update(['user_type' => 'staff']);
        DB::table('users')->where('role', 'client')->update(['role_id' => $roles['client'], 'user_type' => 'client']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
            $table->dropIndex(['user_type']);
            $table->dropColumn(['user_type', 'is_active']);
        });
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('role_permission');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
