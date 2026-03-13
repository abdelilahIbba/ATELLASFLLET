<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\User; // Changed from Client to User
use App\Models\Testimonial;
use App\Models\ActivityLog;
use App\Services\ActivityLogger;
use App\Models\Booking;

class DashboardController extends Controller
{
    // private $activityLogger;

    // public function __construct(ActivityLogger $activityLogger)
    // {
    //     $this->activityLogger = $activityLogger;
    // }

    public function index()
    {
        // Current counts
        $totalCars = Car::count();
        $totalClients = User::count();
        $totalTestimonials = Testimonial::where('is_active', true)->count();

        // Previous month counts
        $lastMonthCars = Car::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)->count();
        $lastMonthClients = User::whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)->count();
        $lastMonthTestimonials = Testimonial::where('is_active', true)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)->count();

        // Percentage change
        $carsPercent = $lastMonthCars ? round((($totalCars - $lastMonthCars) / $lastMonthCars) * 100) : 0;
        $clientsPercent = $lastMonthClients ? round((($totalClients - $lastMonthClients) / $lastMonthClients) * 100) : 0;
        $testimonialsPercent = $lastMonthTestimonials ? round((($totalTestimonials - $lastMonthTestimonials) / $lastMonthTestimonials) * 100) : 0;

        // Booking stats
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $cancelledBookings = Booking::where('status', 'cancelled')->count();
        $recentBookings = Booking::with('car', 'client')->latest()->take(5)->get();

        // Monthly car data for chart (last 6 months)
        $months = [];
        $carCounts = [];
        $clientCounts = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = $date->format('M');
            $carCounts[] = Car::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
            $clientCounts[] = User::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
        }

        // Revenue Overview
        $totalRevenue = Booking::where('status', 'confirmed')->sum('amount') ?? 0;
        $averageBookingValue = Booking::where('status', 'confirmed')->avg('amount') ?? 0;
        // Previous month revenue
        $lastMonthRevenue = Booking::where('status', 'confirmed')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('amount');
        $revenuePercent = ($lastMonthRevenue > 0) ? round((($totalRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100) : 0;

        // Revenue trend for last 6 months
        $revenueMonths = [];
        $revenueData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenueMonths[] = $date->format('M');
            $revenueData[] = Booking::where('status', 'confirmed')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('amount');
        }

        // Previous month average booking value
        $lastMonthAverageBookingValue = Booking::where('status', 'confirmed')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->avg('amount') ?? 0;
        $averageBookingPercent = ($lastMonthAverageBookingValue > 0) ? round((($averageBookingValue - $lastMonthAverageBookingValue) / $lastMonthAverageBookingValue) * 100) : 0;

        // Revenue trend percent (current month vs previous month)
        $currentMonthRevenue = Booking::where('status', 'confirmed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');
        $previousMonthRevenue = Booking::where('status', 'confirmed')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('amount');
        $revenueTrendPercent = ($previousMonthRevenue > 0) ? round((($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100) : 0;

        return view('dashboard', [
            'totalCars' => $totalCars,
            'totalClients' => $totalClients,
            'totalTestimonials' => $totalTestimonials,
            'carsPercent' => $carsPercent,
            'clientsPercent' => $clientsPercent,
            'testimonialsPercent' => $testimonialsPercent,
            'recentActivities' => ActivityLog::latest()->take(5)->get(),
            'totalBookings' => $totalBookings,
            'pendingBookings' => $pendingBookings,
            'confirmedBookings' => $confirmedBookings,
            'cancelledBookings' => $cancelledBookings,
            'recentBookings' => $recentBookings,
            'months' => $months,
            'carCounts' => $carCounts,
            'clientCounts' => $clientCounts,
            'totalRevenue' => $totalRevenue,
            'averageBookingValue' => $averageBookingValue,
            'revenuePercent' => $revenuePercent,
            'revenueMonths' => $revenueMonths,
            'revenueData' => $revenueData,
            'averageBookingPercent' => $averageBookingPercent,
            'revenueTrendPercent' => $revenueTrendPercent,
        ]);
    }
}
