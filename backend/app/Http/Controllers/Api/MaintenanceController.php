<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaintenanceLogResource;
use App\Models\MaintenanceLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MaintenanceController extends Controller
{
    /**
     * GET /api/admin/maintenance
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = MaintenanceLog::with('car');

        if ($request->filled('status'))     $query->where('status', $request->status);
        if ($request->filled('type'))       $query->where('type', $request->type);
        if ($request->filled('car_id'))     $query->where('car_id', $request->car_id);
        if ($request->filled('vehicle_id')) $query->where('car_id', $request->vehicle_id);

        return MaintenanceLogResource::collection(
            $query->latest('date')->paginate($request->get('per_page', 15))
        );
    }

    /**
     * GET /api/admin/maintenance/{maintenanceLog}
     */
    public function show(MaintenanceLog $maintenanceLog): MaintenanceLogResource
    {
        $maintenanceLog->load('car');
        return new MaintenanceLogResource($maintenanceLog);
    }

    /**
     * POST /api/admin/maintenance
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'   => 'required|exists:cars,id',
            'type'     => 'required|in:Oil Change,Tires,Brakes,General Service',
            'date'     => 'required|date',
            'cost'     => 'required|numeric|min:0',
            'provider' => 'nullable|string|max:255',
            'status'   => 'sometimes|in:Completed,Scheduled',
            'notes'    => 'nullable|string',
        ]);

        $log = MaintenanceLog::create($validated);
        $log->load('car');

        return response()->json([
            'message' => 'Maintenance log created.',
            'log'     => new MaintenanceLogResource($log),
        ], 201);
    }

    /**
     * PUT /api/admin/maintenance/{maintenanceLog}
     */
    public function update(Request $request, MaintenanceLog $maintenanceLog): JsonResponse
    {
        $validated = $request->validate([
            'type'     => 'sometimes|in:Oil Change,Tires,Brakes,General Service',
            'date'     => 'sometimes|date',
            'cost'     => 'sometimes|numeric|min:0',
            'provider' => 'nullable|string|max:255',
            'status'   => 'sometimes|in:Completed,Scheduled',
            'notes'    => 'nullable|string',
        ]);

        $maintenanceLog->update($validated);
        $maintenanceLog->load('car');

        return response()->json([
            'message' => 'Maintenance log updated.',
            'log'     => new MaintenanceLogResource($maintenanceLog),
        ]);
    }

    /**
     * DELETE /api/admin/maintenance/{maintenanceLog}
     */
    public function destroy(MaintenanceLog $maintenanceLog): JsonResponse
    {
        $maintenanceLog->delete();
        return response()->json(['message' => 'Maintenance log deleted.']);
    }
}
