<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add missing database indexes on foreign key columns and enforce unique blog slugs.
     */
    public function up(): void
    {
        // Add indexes to bookings foreign keys for query performance
        Schema::table('bookings', function (Blueprint $table) {
            if (!$this->hasIndex('bookings', 'bookings_car_id_index')) {
                $table->index('car_id');
            }
            if (!$this->hasIndex('bookings', 'bookings_user_id_index')) {
                $table->index('user_id');
            }
        });

        // Add indexes to fines foreign keys
        Schema::table('fines', function (Blueprint $table) {
            if (!$this->hasIndex('fines', 'fines_car_id_index')) {
                $table->index('car_id');
            }
            if (!$this->hasIndex('fines', 'fines_user_id_index')) {
                $table->index('user_id');
            }
        });

        // Add index to contacts email for lookups
        Schema::table('contacts', function (Blueprint $table) {
            if (!$this->hasIndex('contacts', 'contacts_email_index')) {
                $table->index('email');
            }
        });

        // Enforce unique blog slugs at the database level
        Schema::table('blogs', function (Blueprint $table) {
            if (!$this->hasIndex('blogs', 'blogs_slug_unique')) {
                $table->unique('slug');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['car_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('fines', function (Blueprint $table) {
            $table->dropIndex(['car_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->dropIndex(['email']);
        });

        Schema::table('blogs', function (Blueprint $table) {
            $table->dropUnique(['slug']);
        });
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        $indexes = Schema::getIndexes($table);
        foreach ($indexes as $index) {
            if ($index['name'] === $indexName) {
                return true;
            }
        }
        return false;
    }
};
