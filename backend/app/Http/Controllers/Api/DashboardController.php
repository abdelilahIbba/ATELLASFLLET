<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard  (admin)
     */
    public function index(): JsonResponse
    {
        $lastMonth = now()->subMonth();

        // Counts
        $totalCars         = Car::count();
        $totalClients      = User::where('role', 'client')->count();
        $totalTestimonials = Testimonial::where('is_active', true)->count();

        // Previous-month counts
        $lastMonthCars    = Car::whereMonth('created_at', $lastMonth->month)->whereYear('created_at', $lastMonth->year)->count();
        $lastMonthClients = User::where('role', 'client')->whereMonth('created_at', $lastMonth->month)->whereYear('created_at', $lastMonth->year)->count();

        $carsPercent    = $lastMonthCars    ? round((($totalCars - $lastMonthCars) / $lastMonthCars) * 100)       : 0;
        $clientsPercent = $lastMonthClients ? round((($totalClients - $lastMonthClients) / $lastMonthClients) * 100) : 0;

        // Bookings
        $totalBookings     = Booking::count();
        $pendingBookings   = Booking::where('status', 'pending')->count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $cancelledBookings = Booking::where('status', 'cancelled')->count();
        $recentBookings    = Booking::with('car', 'client')->latest()->take(5)->get();

        // 6-month trend
        $months = $carCounts = $clientCounts = $revenueMonths = $revenueData = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = now()->subMonths($i);
            $months[]       = $d->format('M');
            $carCounts[]    = Car::whereMonth('created_at', $d->month)->whereYear('created_at', $d->year)->count();
            $clientCounts[] = User::where('role', 'client')->whereMonth('created_at', $d->month)->whereYear('created_at', $d->year)->count();
            $revenueMonths[]= $d->format('M');
            $revenueData[]  = (float) Booking::where('status', 'confirmed')->whereMonth('created_at', $d->month)->whereYear('created_at', $d->year)->sum('amount');
        }

        // Revenue
        $totalRevenue   = (float) (Booking::where('status', 'confirmed')->sum('amount') ?? 0);
        $avgBooking     = (float) (Booking::where('status', 'confirmed')->avg('amount') ?? 0);
        $prevRevenue    = (float) Booking::where('status', 'confirmed')->whereMonth('created_at', $lastMonth->month)->whereYear('created_at', $lastMonth->year)->sum('amount');
        $revenuePercent = $prevRevenue > 0 ? round(($totalRevenue - $prevRevenue) / $prevRevenue * 100) : 0;

        return response()->json([
            'counts'        => compact('totalCars', 'totalClients', 'totalTestimonials', 'totalBookings'),
            'percent'       => compact('carsPercent', 'clientsPercent'),
            'bookings'      => compact('pendingBookings', 'confirmedBookings', 'cancelledBookings', 'recentBookings'),
            'charts'        => compact('months', 'carCounts', 'clientCounts'),
            'revenue'       => [
                'total'          => $totalRevenue,
                'average'        => $avgBooking,
                'percent'        => $revenuePercent,
                'months'         => $revenueMonths,
                'data'           => $revenueData,
            ],
            'recent_activities' => ActivityLog::latest()->take(5)->get(),
        ]);
    }
}
