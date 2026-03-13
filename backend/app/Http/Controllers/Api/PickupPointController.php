<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PickupPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PickupPointController extends Controller
{
    /**
     * GET /api/pickup-points  (public — clients need this list)
     */
    public function index(): JsonResponse
    {
        $points = PickupPoint::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($points);
    }

    /**
     * GET /api/admin/pickup-points  (admin — full list including inactive)
     */
    public function adminIndex(): JsonResponse
    {
        $points = PickupPoint::orderBy('name')->get();

        return response()->json($points);
    }

    /**
     * POST /api/admin/pickup-points
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'address'   => 'required|string|max:500',
            'latitude'  => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'type'      => 'required|in:pickup,dropoff,both',
            'is_active' => 'boolean',
            'notes'     => 'nullable|string|max:1000',
        ]);

        $point = PickupPoint::create($validated);

        return response()->json($point, 201);
    }

    /**
     * PUT /api/admin/pickup-points/{pickupPoint}
     */
    public function update(Request $request, PickupPoint $pickupPoint): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'address'   => 'sometimes|required|string|max:500',
            'latitude'  => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'type'      => 'sometimes|required|in:pickup,dropoff,both',
            'is_active' => 'boolean',
            'notes'     => 'nullable|string|max:1000',
        ]);

        $pickupPoint->update($validated);

        return response()->json($pickupPoint);
    }

    /**
     * DELETE /api/admin/pickup-points/{pickupPoint}
     */
    public function destroy(PickupPoint $pickupPoint): JsonResponse
    {
        $pickupPoint->delete();

        return response()->json(['message' => 'Point supprimé.']);
    }
}
