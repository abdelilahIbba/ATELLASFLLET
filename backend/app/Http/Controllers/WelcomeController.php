<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Testimonial;

class WelcomeController extends Controller
{
    public function index()
    {
        $cars = Car::where('availability', 'available')
               ->where('quantity', '>', 0)
               ->latest()
               ->get();

        $testimonials = Testimonial::where('is_active', true)
                     ->latest()
                     ->get();

        return view('welcome', compact('cars', 'testimonials'));
    }
}