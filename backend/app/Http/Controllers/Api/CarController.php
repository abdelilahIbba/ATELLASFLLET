<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CarResource;
use App\Models\Booking;
use App\Models\Car;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;

class CarController extends Controller
{
    /**
     * GET /api/cars
     * List all available cars (public) or all cars (admin).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Car::query();

        // Public users only see available cars
        if (!$request->user() || $request->user()->role !== 'admin') {
            $query->where('availability', 'available');
        }

        // Filters
        if ($request->filled('make'))      $query->where('make', 'like', '%' . $request->make . '%');
        if ($request->filled('model'))     $query->where('model', 'like', '%' . $request->model . '%');
        if ($request->filled('year'))      $query->where('year', $request->year);
        if ($request->filled('fuel_type')) $query->where('fuel_type', $request->fuel_type);
        if ($request->filled('min_price')) $query->where('daily_price', '>=', $request->min_price);
        if ($request->filled('max_price')) $query->where('daily_price', '<=', $request->max_price);

        $allowedSortColumns = ['created_at', 'daily_price', 'year', 'make', 'model'];
        $sortBy  = in_array($request->get('sort_by'), $allowedSortColumns) ? $request->get('sort_by') : 'created_at';
        $rawDir  = strtolower($request->get('sort_dir', 'desc'));
        $sortDir = in_array($rawDir, ['asc', 'desc']) ? $rawDir : 'desc';
        $query->orderBy($sortBy, $sortDir);

        return CarResource::collection($query->paginate($request->get('per_page', 15)));
    }

    /**
     * GET /api/cars/{car}
     */
    public function show(Car $car): CarResource
    {
        return new CarResource($car);
    }

    /**
     * POST /api/cars  (admin)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'model'        => 'required|string|max:255',
            'make'         => 'required|string|max:255',
            'year'         => 'required|digits:4',
            'fuel_type'    => 'required|string',
            'daily_price'  => 'required|numeric|min:0',
            'availability' => 'required|in:available,unavailable',
            'quantity'     => 'required|integer|min:0',
            'image'        => 'nullable|image|max:2048',
            'image_url'    => 'nullable|url|max:2048',
            // New vehicle fields
            'category'                => 'nullable|string|max:100',
            'features'                => 'nullable|array',
            'plate'                   => 'nullable|string|max:20|unique:cars,plate',
            'unit_plates'             => 'nullable|array',
            'unit_plates.*'           => 'nullable|string|max:20',
            'branch'                  => 'nullable|string|max:150',
            'latitude'                => 'nullable|numeric|between:-90,90',
            'longitude'               => 'nullable|numeric|between:-180,180',
            'status'                  => 'nullable|in:Available,Rented,Maintenance,Impounded',
            'fuel_level'              => 'nullable|integer|between:0,100',
            'odometer'                => 'nullable|integer|min:0',
            'condition'               => 'nullable|in:Excellent,Good,Service Due',
            'insurance_expiry'        => 'nullable|date',
            'visite_technique_expiry' => 'nullable|date',
            'vignette_expiry'         => 'nullable|date',
            'carte_grise_expiry'      => 'nullable|date',
            'doc_insurance'           => 'nullable|file|max:4096|mimes:pdf,jpg,jpeg,png',
            'doc_visite_technique'    => 'nullable|file|max:4096|mimes:pdf,jpg,jpeg,png',
            'doc_vignette'            => 'nullable|file|max:4096|mimes:pdf,jpg,jpeg,png',
            'doc_carte_grise'         => 'nullable|file|max:4096|mimes:pdf,jpg,jpeg,png',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('cars', 'public');
        } elseif (!empty($validated['image_url'])) {
            $validated['image'] = $validated['image_url'];
        }
        unset($validated['image_url']);
        foreach (['doc_insurance', 'doc_visite_technique', 'doc_vignette', 'doc_carte_grise'] as $docField) {
            if ($request->hasFile($docField)) {
                $validated[$docField] = $request->file($docField)->store('cars/docs', 'public');
            }
        }

        $car = Car::create($validated);

        return response()->json([
            'message' => 'Car created successfully.',
            'car'     => new CarResource($car),
        ], 201);
    }

    /**
     * PUT /api/cars/{car}  (admin)
     */
    public function update(Request $request, Car $car): JsonResponse
    {
        $validated = $request->validate([
            'model'        => 'sometimes|required|string|max:255',
            'make'         => 'sometimes|required|string|max:255',
            'year'         => 'sometimes|required|digits:4',
            'fuel_type'    => 'sometimes|required|string',
            'daily_price'  => 'sometimes|required|numeric|min:0',
            'availability' => 'sometimes|required|in:available,unavailable',
            'quantity'     => 'sometimes|required|integer|min:0',
            'image'        => 'nullable|image|max:2048',
            'image_url'    => 'nullable|url|max:2048',
            // New vehicle fields
            'category'                => 'nullable|string|max:100',
            'features'                => 'nullable|array',
            'plate'                   => 'nullable|string|max:20|unique:cars,plate,' . $car->id,
            'unit_plates'             => 'nullable|array',
            'unit_plates.*'           => 'nullable|string|max:20',
            'branch'                  => 'nullable|string|max:150',
            'latitude'                => 'nullable|numeric|between:-90,90',
            'longitude'               => 'nullable|numeric|between:-180,180',
            'status'                  => 'nullable|in:Available,Rented,Maintenance,Impounded',
            'fuel_level'              => 'nullable|integer|between:0,100',
            'odometer'                => 'nullable|integer|min:0',
            'condition'               => 'nullable|in:Excellent,Good,Service Due',
            'insurance_expiry'        => 'nullable|date',
            'visite_technique_expiry' => 'nullable|date',
            'vignette_expiry'         => 'nullable|date',
            'carte_grise_expiry'      => 'nullable|date',
            'doc_insurance'           => 'nullable|file|max:4096|mimes:pdf,jpg,jpeg,png',
            'doc_visite_technique'    => 'nullable|file|max:4096|mimes:pdf,jpg,jpeg,png',
            'doc_vignette'            => 'nullable|file|max:4096|mimes:pdf,jpg,jpeg,png',
            'doc_carte_grise'         => 'nullable|file|max:4096|mimes:pdf,jpg,jpeg,png',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('cars', 'public');
        } elseif (!empty($validated['image_url'])) {
            $validated['image'] = $validated['image_url'];
        }
        unset($validated['image_url']);
        foreach (['doc_insurance', 'doc_visite_technique', 'doc_vignette', 'doc_carte_grise'] as $docField) {
            if ($request->hasFile($docField)) {
                $validated[$docField] = $request->file($docField)->store('cars/docs', 'public');
            }
        }

        $car->update($validated);

        return response()->json([
            'message' => 'Car updated successfully.',
            'car'     => new CarResource($car->fresh()),
        ]);
    }

    /**
     * PATCH /api/admin/cars/{car}/gps  — update live GPS coordinates
     */
    public function updateGps(Request $request, Car $car): JsonResponse
    {
        $validated = $request->validate([
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $car->update($validated);

        return response()->json([
            'message'   => 'GPS location updated.',
            'latitude'  => $car->latitude,
            'longitude' => $car->longitude,
        ]);
    }

    /**
     * DELETE /api/cars/{car}  (admin)
     */
    public function destroy(Car $car): JsonResponse
    {
        $car->delete();
        return response()->json(['message' => 'Car deleted successfully.']);
    }

    /**
     * POST /api/cars/check-availability  (legacy – kept for back-compat)
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'     => 'required|exists:cars,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after:start_date',
        ]);

        $car            = Car::findOrFail($validated['car_id']);
        $startDate      = Carbon::parse($validated['start_date']);
        $endDate        = Carbon::parse($validated['end_date']);
        $remainingUnits = $car->remainingUnits($startDate, $endDate);
        $rentalDays     = max(1, $startDate->diffInDays($endDate));
        $totalPrice     = $rentalDays * $car->daily_price;

        return response()->json([
            'car_id'          => $car->id,
            'available'       => $remainingUnits > 0,
            'remaining_units' => $remainingUnits,
            'rental_days'     => $rentalDays,
            'daily_price'     => (float) $car->daily_price,
            'total_price'     => $totalPrice,
        ]);
    }

    /**
     * GET /api/cars/{car}/booked-periods
     *
     * Returns all active booking date ranges for the next 3 months.
     * Used by the client booking modal to render an availability calendar.
     * Plate numbers / unit details are intentionally withheld.
     */
    public function bookedPeriods(Car $car): JsonResponse
    {
        $today   = Carbon::today();
        $horizon = Carbon::today()->addMonths(3)->endOfMonth();

        $bookings = Booking::where('car_id', $car->id)
            ->whereNotIn('status', ['cancelled'])
            ->where('end_date',   '>=', $today)
            ->where('start_date', '<=', $horizon)
            ->orderBy('start_date')
            ->get(['start_date', 'end_date']);

        return response()->json([
            'total_units'    => max(1, (int) $car->quantity),
            'booked_periods' => $bookings->map(fn ($b) => [
                'start' => Carbon::parse($b->start_date)->format('Y-m-d'),
                'end'   => Carbon::parse($b->end_date)->format('Y-m-d'),
            ])->values(),
        ]);
    }
}
