<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Testimonial;
use Illuminate\Support\Collection;

class WelcomeController extends Controller
{
    public function index()
    {
        // Guard against DB being temporarily unavailable (quota exceeded, cold-start, etc.)
        // The view receives empty collections rather than crashing with a 500.
        try {
            $cars = Car::where('availability', 'available')
                   ->where('quantity', '>', 0)
                   ->latest()
                   ->get();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('WelcomeController: could not load cars — ' . $e->getMessage());
            $cars = new Collection();
        }

        try {
            $testimonials = Testimonial::where('is_active', true)
                         ->latest()
                         ->get();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('WelcomeController: could not load testimonials — ' . $e->getMessage());
            $testimonials = new Collection();
        }

        return view('welcome', compact('cars', 'testimonials'));
    }
}