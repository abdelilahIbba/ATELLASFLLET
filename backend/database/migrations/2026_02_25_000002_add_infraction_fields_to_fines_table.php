<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fines', function (Blueprint $table) {
            // Due date for settling the fine
            $table->date('due_date')->nullable()->after('date');
            // Notification/PV reference number from official letter
            $table->string('notification_ref', 100)->nullable()->after('notes');
        });

        // Expand the type column to support all infraction categories.
        // The column is a plain VARCHAR so no enum alteration is needed;
        // validation is enforced at the application layer.
    }

    public function down(): void
    {
        Schema::table('fines', function (Blueprint $table) {
            $table->dropColumn(['due_date', 'notification_ref']);
        });
    }
};
