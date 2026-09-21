<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AnalyticsController extends Controller
{
    /**
     * GET /api/admin/analytics
     * Aggregates real fleet/booking data. No mock, seeded, or hard-coded values.
     */
    public function index(Request $request): JsonResponse
    {
        $now = now();
        $totalCarUnits = Car::sum('quantity') ?: Car::count();

        // ── 12-month trend: revenue, target revenue, bookings, utilization ──
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $d = $now->copy()->subMonths($i)->startOfMonth();
            $monthStart = $d->copy()->startOfMonth();
            $monthEnd = $d->copy()->endOfMonth();

            $confirmed = Booking::whereIn('status', ['confirmed', 'completed'])
                ->whereBetween('start_date', [$monthStart->toDateString(), $monthEnd->toDateString()]);

            $actualRevenue = (float) (clone $confirmed)->sum('amount');
            $bookingsCount = (int) (clone $confirmed)->count();

            // Fleet utilization = booked car-days / available car-days for the month
            $bookedDays = Booking::whereNotIn('status', ['cancelled'])
                ->where('start_date', '<=', $monthEnd->toDateString())
                ->where('end_date', '>=', $monthStart->toDateString())
                ->get(['start_date', 'end_date'])
                ->sum(function ($b) use ($monthStart, $monthEnd) {
                    $start = Carbon::parse($b->start_date)->max($monthStart);
                    $end = Carbon::parse($b->end_date)->min($monthEnd);
                    return max(0, $start->diffInDays($end) + 1);
                });

            $availableDays = max(1, $totalCarUnits) * $monthStart->daysInMonth;
            $utilization = min(100, round(($bookedDays / $availableDays) * 100, 1));

            // Target = 110% of the average monthly revenue over the previous 6 months
            $priorRevenue = Booking::whereIn('status', ['confirmed', 'completed'])
                ->where('start_date', '>=', $monthStart->copy()->subMonths(6)->startOfMonth()->toDateString())
                ->where('start_date', '<', $monthStart->toDateString())
                ->sum('amount');
            $targetRevenue = $priorRevenue > 0
                ? round(($priorRevenue / 6) * 1.1)
                : round($actualRevenue * 1.1);

            $months[] = [
                'name' => $d->translatedFormat('M'),
                'Actual' => $actualRevenue,
                'Target' => $targetRevenue,
                'Bookings' => $bookingsCount,
                'Utilization' => $utilization,
                'TargetUtilization' => 85,
            ];
        }

        // ── KPIs with month-over-month trends ──
        $currentMonthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $totalRevenue = (float) Booking::whereIn('status', ['confirmed', 'completed'])->sum('amount');
        $curMonthRevenue = (float) Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereBetween('start_date', [$currentMonthStart->toDateString(), $now->toDateString()])
            ->sum('amount');
        $prevMonthRevenue = (float) Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereBetween('start_date', [$lastMonthStart->toDateString(), $lastMonthEnd->toDateString()])
            ->sum('amount');
        $revenueTrend = $prevMonthRevenue > 0
            ? round((($curMonthRevenue - $prevMonthRevenue) / $prevMonthRevenue) * 100, 1)
            : 0;

        $currentUtilization = $months[count($months) - 1]['Utilization'] ?? 0;
        $prevUtilization = $months[count($months) - 2]['Utilization'] ?? 0;
        $utilizationTrend = $prevUtilization > 0
            ? round((($currentUtilization - $prevUtilization) / $prevUtilization) * 100, 1)
            : 0;

        $activeBookings = Booking::whereIn('status', ['confirmed', 'pending'])->count();
        $curMonthBookings = Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereBetween('start_date', [$currentMonthStart->toDateString(), $now->toDateString()])
            ->count();
        $prevMonthBookings = Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereBetween('start_date', [$lastMonthStart->toDateString(), $lastMonthEnd->toDateString()])
            ->count();
        $bookingsTrend = $prevMonthBookings > 0
            ? round((($curMonthBookings - $prevMonthBookings) / $prevMonthBookings) * 100, 1)
            : 0;

        $avgSatisfaction = round((float) Review::avg('rating'), 1) ?: 0;

        // ── Most requested/rented cars from real reservation data ──
        $topRequestedCars = Car::select('cars.id', 'cars.make', 'cars.model', 'cars.category')
            ->selectRaw('COUNT(bookings.id) as rentals_count')
            ->leftJoin('bookings', function ($join) {
                $join->on('bookings.car_id', '=', 'cars.id')
                     ->whereIn('bookings.status', ['confirmed', 'completed']);
            })
            ->groupBy('cars.id', 'cars.make', 'cars.model', 'cars.category')
            ->orderByDesc('rentals_count')
            ->orderByDesc('cars.id')
            ->limit(5)
            ->get()
            ->map(fn ($car) => [
                'id' => $car->id,
                'name' => trim("{$car->make} {$car->model}"),
                'category' => $car->category ?? 'Non catégorisé',
                'rentals_count' => (int) $car->rentals_count,
            ]);

        // ── Revenue distribution by real vehicle category ──
        $categoryRevenue = Booking::whereIn('bookings.status', ['confirmed', 'completed'])
            ->join('cars', 'cars.id', '=', 'bookings.car_id')
            ->selectRaw("COALESCE(cars.category, 'Autre') as category, SUM(bookings.amount) as total")
            ->groupBy('cars.category')
            ->orderByDesc('total')
            ->pluck('total', 'category');

        $categoryTotal = $categoryRevenue->sum() ?: 1;
        $palette = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
        $clientSegments = [];
        $idx = 0;
        foreach ($categoryRevenue as $category => $total) {
            $clientSegments[] = [
                'name' => $category,
                'value' => round(($total / $categoryTotal) * 100),
                'color' => $palette[$idx % count($palette)],
            ];
            $idx++;
        }

        // ── Vehicle performance matrix (top revenue-generating cars) ──
        $vehiclePerformance = Car::withCount(['bookings as bookings_count' => function ($q) {
                $q->whereIn('status', ['confirmed', 'completed']);
            }])
            ->withSum(['bookings as revenue_sum' => function ($q) {
                $q->whereIn('status', ['confirmed', 'completed']);
            }], 'amount')
            ->withSum('maintenanceLogs as maintenance_sum', 'cost')
            ->orderByDesc('revenue_sum')
            ->take(5)
            ->get()
            ->map(function ($car) {
                $distinctClients = Booking::where('car_id', $car->id)
                    ->whereIn('status', ['confirmed', 'completed'])
                    ->distinct('user_id')
                    ->count('user_id');
                $repeatClients = Booking::where('car_id', $car->id)
                    ->whereIn('status', ['confirmed', 'completed'])
                    ->select('user_id')
                    ->groupBy('user_id')
                    ->havingRaw('COUNT(*) > 1')
                    ->get()
                    ->count();
                $retention = $distinctClients > 0 ? round(($repeatClients / $distinctClients) * 100) : 0;

                return [
                    'name' => trim("{$car->make} {$car->model}"),
                    'revenue' => (float) ($car->revenue_sum ?? 0),
                    'bookings' => (int) ($car->bookings_count ?? 0),
                    'retention' => $retention,
                    'maintenance' => (float) ($car->maintenance_sum ?? 0),
                ];
            });

        // ── Marketing/ops insights derived from the real numbers above ──
        $insights = $this->buildInsights($months, $clientSegments, $vehiclePerformance, $currentUtilization);

        return response()->json([
            'trend' => $months,
            'monthlySummary' => $months,
            'kpis' => [
                'totalRevenue' => $totalRevenue,
                'revenueTrend' => $revenueTrend,
                'utilization' => $currentUtilization,
                'utilizationTrend' => $utilizationTrend,
                'activeBookings' => $activeBookings,
                'bookingsTrend' => $bookingsTrend,
                'satisfaction' => $avgSatisfaction,
            ],
            'topRequestedCars' => $topRequestedCars,
            'clientSegments' => $clientSegments,
            'vehiclePerformance' => $vehiclePerformance,
            'insights' => $insights,
        ]);
    }

    /**
     * Build actionable recommendations from real statistical trends.
     */
    private function buildInsights(
        array $months,
        array $clientSegments,
        $vehiclePerformance,
        float $currentUtilization
    ): array {
        $insights = [];

        $topRetention = collect($vehiclePerformance)->sortByDesc('retention')->first();
        if ($topRetention && $topRetention['retention'] > 0) {
            $insights[] = [
                'title' => 'Stratégie de Rétention',
                'type' => 'retention',
                'text' => "\"{$topRetention['name']}\" affiche le meilleur taux de rétention client ({$topRetention['retention']}%). Créez une offre de fidélité dédiée pour ce modèle afin d'encourager les locations récurrentes.",
            ];
        }

        $topSegment = collect($clientSegments)->sortByDesc('value')->first();
        if ($topSegment) {
            $insights[] = [
                'title' => 'Acquisition Client',
                'type' => 'acquisition',
                'text' => "La catégorie \"{$topSegment['name']}\" représente {$topSegment['value']}% du chiffre d'affaires réservations. Priorisez les campagnes marketing sur ce segment de véhicules.",
            ];
        }

        if ($currentUtilization < 70) {
            $insights[] = [
                'title' => 'Alerte Utilisation',
                'type' => 'utilization',
                'text' => "Le taux d'utilisation de la flotte est de {$currentUtilization}%, sous l'objectif de 85%. Envisagez une promotion 'Affaires de la Semaine' pour stimuler la demande en période creuse.",
            ];
        } else {
            $insights[] = [
                'title' => 'Performance Utilisation',
                'type' => 'utilization',
                'text' => "Le taux d'utilisation de la flotte est de {$currentUtilization}%, proche ou au-dessus de l'objectif. Surveillez la disponibilité pour éviter les ruptures de stock.",
            ];
        }

        $lastMonth = end($months);
        if ($lastMonth && $lastMonth['Target'] > 0) {
            $gap = round((($lastMonth['Actual'] - $lastMonth['Target']) / $lastMonth['Target']) * 100, 1);
            if ($gap < 0) {
                $insights[] = [
                    'title' => 'Écart Objectif Revenu',
                    'type' => 'revenue',
                    'text' => "Le revenu du mois courant est " . abs($gap) . "% en dessous de l'objectif. Identifiez les canaux de réservation les moins performants pour réorienter les efforts marketing.",
                ];
            }
        }

        return $insights;
    }
}
