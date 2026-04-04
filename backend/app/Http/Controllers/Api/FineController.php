<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FineResource;
use App\Models\Car;
use App\Models\Fine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FineController extends Controller
{
    /**
     * GET /api/admin/fines
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Fine::with(['car', 'user']);

        if ($request->filled('status'))   $query->where('status', $request->status);
        if ($request->filled('type'))     $query->where('type', $request->type);
        if ($request->filled('car_id'))   $query->where('car_id', $request->car_id);
        if ($request->filled('vehicle_id')) $query->where('car_id', $request->vehicle_id);
        if ($request->filled('user_id'))  $query->where('user_id', $request->user_id);

        return FineResource::collection(
            $query->latest()->paginate($request->get('per_page', 15))
        );
    }

    /**
     * GET /api/admin/fines/{fine}
     */
    public function show(Fine $fine): FineResource
    {
        $fine->load(['car', 'user']);
        return new FineResource($fine);
    }

    /**
     * POST /api/admin/fines
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'           => 'required|exists:cars,id',
            'user_id'          => 'nullable|exists:users,id',
            'driver_name'      => 'required|string|max:255',
            'date'             => 'required|date',
            'due_date'         => 'nullable|date',
            'type'             => 'required|in:Radar,Parking,Speeding,Police Check,insurance_expired,visite_expired,seatbelt,phone,overtaking,missing_docs,unpaid_toll',
            'amount'           => 'required|numeric|min:0',
            'location'         => 'nullable|string|max:255',
            'status'           => 'sometimes|in:Paid,Unpaid,Disputed',
            'notes'            => 'nullable|string',
            'notification_ref' => 'nullable|string|max:100',
        ]);

        // Track which admin recorded this infraction if not explicitly provided
        if (!isset($validated['user_id'])) {
            $validated['user_id'] = $request->user()->id;
        }

        $fine = Fine::create($validated);
        $fine->load(['car', 'user']);

        return response()->json([
            'message' => 'Fine recorded successfully.',
            'fine'    => new FineResource($fine),
        ], 201);
    }

    /**
     * PUT /api/admin/fines/{fine}
     */
    public function update(Request $request, Fine $fine): JsonResponse
    {
        $validated = $request->validate([
            'driver_name'      => 'sometimes|string|max:255',
            'date'             => 'sometimes|date',
            'due_date'         => 'nullable|date',
            'type'             => 'sometimes|in:Radar,Parking,Speeding,Police Check,insurance_expired,visite_expired,seatbelt,phone,overtaking,missing_docs,unpaid_toll',
            'amount'           => 'sometimes|numeric|min:0',
            'location'         => 'nullable|string|max:255',
            'status'           => 'sometimes|in:Paid,Unpaid,Disputed',
            'notes'            => 'nullable|string',
            'notification_ref' => 'nullable|string|max:100',
        ]);

        $fine->update($validated);
        $fine->load(['car', 'user']);

        return response()->json([
            'message' => 'Fine updated.',
            'fine'    => new FineResource($fine),
        ]);
    }

    /**
     * DELETE /api/admin/fines/{fine}
     */
    public function destroy(Fine $fine): JsonResponse
    {
        $fine->delete();
        return response()->json(['message' => 'Fine deleted.']);
    }

    /**
     * GET /api/admin/cars/{car}/infractions
     * Return all infractions for a specific car (used by the vehicle modal).
     */
    public function carInfractions(Car $car): AnonymousResourceCollection
    {
        $fines = Fine::where('car_id', $car->id)
            ->orderBy('date', 'desc')
            ->get();

        return FineResource::collection($fines);
    }
}
