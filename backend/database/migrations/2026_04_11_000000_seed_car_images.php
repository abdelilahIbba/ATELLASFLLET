<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * One-time migration to set default image URLs on cars that were seeded
 * without images. Runs automatically on every deploy via `php artisan migrate`.
 * Only updates cars that still have the seeder's plate numbers and a null/empty image.
 */
return new class extends Migration
{
    private array $images = [
        'A-12345-B' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
        'A-23456-B' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
        'B-34567-C' => 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200',
        'C-45678-D' => 'https://images.unsplash.com/photo-1616422285623-14ff4efc22d5?auto=format&fit=crop&w=1200&q=80',
        'D-56789-E' => 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'E-67890-F' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
        'F-78901-G' => 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&q=80&w=1200',
        'G-89012-H' => 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&q=80&w=1200',
    ];

    public function up(): void
    {
        foreach ($this->images as $plate => $imageUrl) {
            DB::table('cars')
                ->where('plate', $plate)
                ->where(function ($q) {
                    $q->whereNull('image')->orWhere('image', '');
                })
                ->update(['image' => $imageUrl]);
        }

        // Also fix any cars whose image was set to a known bad webpage URL
        // (e.g., the carsales.com.au research page entered accidentally)
        DB::table('cars')
            ->where('plate', 'G-89012-H')
            ->where('image', 'LIKE', '%carsales.com.au%')
            ->update(['image' => 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&q=80&w=1200']);
    }

    public function down(): void
    {
        // Not reversible — images were not set before
    }
};
