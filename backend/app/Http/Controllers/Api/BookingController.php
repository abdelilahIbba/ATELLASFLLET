<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FinalizeReservationRequest;
use App\Http\Requests\VerifyIdentityRequest;
use App\Http\Resources\BookingResource;
use App\Mail\ReservationConfirmationMail;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    // ─── Private Helpers ─────────────────────────────────────────────────────

    /**
     * Find the first unit slot (1-based) that has no overlapping active booking.
     * Returns null when all units are occupied.
     *
     * @param  int       $carId
     * @param  string    $startDate  Y-m-d
     * @param  string    $endDate    Y-m-d
     * @param  int|null  $exceptBookingId  exclude this booking ID (for updates)
     * @param  int       $quantity
     * @return int|null
     */
    private function findAvailableUnit(
        int $carId,
        string $startDate,
        string $endDate,
        ?int $exceptBookingId = null,
        int $quantity = 1
    ): ?int {
        for ($unit = 1; $unit <= $quantity; $unit++) {
            $overlap = Booking::where('car_id', $carId)
                ->where('unit_number', $unit)
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->when($exceptBookingId, fn ($q) => $q->where('id', '!=', $exceptBookingId))
                // Overlap: existing.start <= req.end AND existing.end >= req.start
                ->where('start_date', '<=', $endDate)
                ->where('end_date',   '>=', $startDate)
                ->exists();

            if (! $overlap) {
                return $unit;
            }
        }
        return null; // all units occupied
    }

    /**
     * Scan forward from the day after $requestedEnd to find the earliest free window
     * of the same duration (inclusive) on any unit of the car.
     *
     * Returns ['start' => 'Y-m-d', 'end' => 'Y-m-d'] or null when nothing found
     * within one year from today.
     */
    private function findNextAvailableSlot(
        int $carId,
        string $requestedStart,
        string $requestedEnd,
        int $quantity,
        ?int $exceptBookingId = null
    ): ?array {
        // Same duration: diffInDays gives exclusive diff (0 for same-day=1-day booking)
        $durationDays = Carbon::parse($requestedStart)->diffInDays(Carbon::parse($requestedEnd));

        $candidate = Carbon::parse($requestedEnd)->addDay();
        $maxDate   = Carbon::now()->addYear();

        while ($candidate->lte($maxDate)) {
            $candidateEnd = $candidate->copy()->addDays($durationDays);

            $unit = $this->findAvailableUnit(
                $carId,
                $candidate->toDateString(),
                $candidateEnd->toDateString(),
                $exceptBookingId,
                $quantity
            );

            if ($unit !== null) {
                return [
                    'start' => $candidate->toDateString(),
                    'end'   => $candidateEnd->toDateString(),
                ];
            }

            // Advance past the earliest-ending booking that blocks this window
            $earliestBlockEnd = Booking::where('car_id', $carId)
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->when($exceptBookingId, fn ($q) => $q->where('id', '!=', $exceptBookingId))
                ->where('start_date', '<=', $candidateEnd->toDateString())
                ->where('end_date',   '>=', $candidate->toDateString())
                ->min('end_date');

            if (! $earliestBlockEnd) {
                break; // No blockers found — safety escape
            }

            $candidate = Carbon::parse($earliestBlockEnd)->addDay();
        }

        return null;
    }

    /**
     * Build a human-readable list of already-booked units for a car + period.
     */
    private function occupiedUnits(int $carId, string $startDate, string $endDate, ?int $exceptBookingId = null): array
    {
        return Booking::where('car_id', $carId)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->when($exceptBookingId, fn ($q) => $q->where('id', '!=', $exceptBookingId))
            ->where('start_date', '<=', $endDate)
            ->where('end_date',   '>=', $startDate)
            ->pluck('unit_number')
            ->sort()
            ->values()
            ->all();
    }

    // ─── Public Endpoints ────────────────────────────────────────────────────
    /**
     * GET /api/bookings
     * Admin: all bookings. Client: own bookings.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Booking::with(['car', 'user']);

        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('status'))  $query->where('status', $request->status);
        if ($request->filled('car_id'))  $query->where('car_id', $request->car_id);
        if ($request->filled('user_id') && $request->user()->role === 'admin') {
            $query->where('user_id', $request->user_id);
        }

        return BookingResource::collection(
            $query->latest()->paginate($request->get('per_page', 15))
        );
    }

    /**
     * GET /api/bookings/{booking}
     */
    public function show(Request $request, Booking $booking): JsonResponse
    {
        if ($request->user()->role !== 'admin' && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $booking->load(['car', 'user']);

        return response()->json(['booking' => new BookingResource($booking)]);
    }

    /**
     * POST /api/bookings
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'     => 'required|exists:cars,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $car = Car::findOrFail($validated['car_id']);

        if ($car->availability === 'unavailable') {
            return response()->json(['message' => 'This car is currently unavailable.'], 422);
        }

        $startDate = Carbon::parse($validated['start_date']);
        $endDate   = Carbon::parse($validated['end_date']);

        if ($car->quantity <= 0) {
            return response()->json(['message' => 'This car is currently out of stock.'], 422);
        }

        $remainingUnits = $car->remainingUnits($startDate, $endDate);

        // Auto-assign to the first free unit slot
        $qty        = max(1, $car->quantity);
        $unitNumber = ($remainingUnits > 0)
            ? $this->findAvailableUnit($car->id, $startDate->toDateString(), $endDate->toDateString(), null, $qty)
            : null;

        if ($unitNumber === null) {
            $suggested = $this->findNextAvailableSlot(
                $car->id,
                $startDate->toDateString(),
                $endDate->toDateString(),
                $qty
            );
            return response()->json([
                'message'        => 'All units are booked for the selected dates.',
                'suggested_slot' => $suggested,
            ], 422);
        }

        $rentalDays = $startDate->diffInDays($endDate) + 1; // inclusive (1 day when start == end)
        $amount     = $rentalDays * $car->daily_price;

        $booking = Booking::create([
            'user_id'     => $request->user()->id,
            'car_id'      => $car->id,
            'unit_number' => $unitNumber,
            'start_date'  => $startDate->toDateString(),
            'end_date'    => $endDate->toDateString(),
            'status'      => 'pending',
            'amount'      => $amount,
        ]);

        $booking->load(['car', 'user']);

        return response()->json([
            'message' => 'Booking created successfully.',
            'booking' => new BookingResource($booking),
        ], 201);
    }

    /**
     * GET /api/admin/bookings  (admin)
     */
    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $query = Booking::with(['car', 'user']);

        if ($request->filled('status'))  $query->where('status', $request->status);
        if ($request->filled('user_id')) $query->where('user_id', $request->user_id);
        if ($request->filled('car_id'))  $query->where('car_id',  $request->car_id);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('user', fn ($q2) => $q2->where('name', 'like', "%{$s}%"))
                  ->orWhere('id', 'like', "%{$s}%");
            });
        }

        return BookingResource::collection(
            $query->latest()->paginate($request->get('per_page', 100))
        );
    }

    /**
     * POST /api/admin/bookings  (admin create)
     */
    public function adminStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'        => 'required|exists:users,id',
            'car_id'         => 'required|exists:cars,id',
            'unit_number'    => 'sometimes|nullable|integer|min:1',
            'start_date'     => 'required|date',
            'end_date'       => 'required|date|after_or_equal:start_date',
            'status'         => 'sometimes|in:pending,confirmed,active,completed,cancelled',
            'payment_status' => 'sometimes|in:Paid,Deposit Only,Unpaid',
            'amount'         => 'sometimes|nullable|numeric|min:0',
            'notes'          => 'nullable|string|max:2000',
            'pickup_point_id'  => 'nullable|exists:pickup_points,id',
            'dropoff_point_id' => 'nullable|exists:pickup_points,id',
        ]);

        $car        = Car::findOrFail($validated['car_id']);
        $startDate  = Carbon::parse($validated['start_date']);
        $endDate    = Carbon::parse($validated['end_date']);

        // ── Unit assignment ──
        $quantity = max(1, $car->quantity);

        // If admin explicitly passes unit_number, validate it; otherwise auto-assign.
        if (isset($validated['unit_number'])) {
            $requestedUnit = (int) $validated['unit_number'];
            if ($requestedUnit < 1 || $requestedUnit > $quantity) {
                return response()->json([
                    'message' => "Unité #{$requestedUnit} invalide pour ce véhicule (1–{$quantity}).",
                ], 422);
            }
            $overlap = Booking::where('car_id', $car->id)
                ->where('unit_number', $requestedUnit)
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->where('start_date', '<=', $endDate->toDateString())
                ->where('end_date',   '>=', $startDate->toDateString())
                ->exists();
            if ($overlap) {
                $occupied = $this->occupiedUnits($car->id, $startDate->toDateString(), $endDate->toDateString());
                return response()->json([
                    'message'        => "L'unité #{$requestedUnit} est déjà réservée sur cette période.",
                    'occupied_units' => $occupied,
                ], 422);
            }
            $unitNumber = $requestedUnit;
        } else {
            $unitNumber = $this->findAvailableUnit(
                $car->id,
                $startDate->toDateString(),
                $endDate->toDateString(),
                null,
                $quantity
            );
            if ($unitNumber === null) {
                $occupied  = $this->occupiedUnits($car->id, $startDate->toDateString(), $endDate->toDateString());
                $suggested = $this->findNextAvailableSlot(
                    $car->id,
                    $startDate->toDateString(),
                    $endDate->toDateString(),
                    $quantity
                );
                return response()->json([
                    'message'        => "Toutes les unités ({$quantity}) sont réservées sur cette période.",
                    'occupied_units' => $occupied,
                    'suggested_slot' => $suggested,
                ], 422);
            }
        }

        $rentalDays = $startDate->diffInDays($endDate) + 1; // inclusive (1 day when start == end)
        $amount     = isset($validated['amount']) && $validated['amount'] !== null
                      ? (float) $validated['amount']
                      : $rentalDays * (float) $car->daily_price;

        $booking = Booking::create([
            'user_id'        => $validated['user_id'],
            'car_id'         => $validated['car_id'],
            'unit_number'    => $unitNumber,
            'start_date'     => $startDate->toDateString(),
            'end_date'       => $endDate->toDateString(),
            'status'         => $validated['status'] ?? 'confirmed',
            'payment_status' => $validated['payment_status'] ?? 'Unpaid',
            'amount'         => $amount,
            'notes'            => $validated['notes'] ?? null,
            'pickup_point_id'  => $validated['pickup_point_id'] ?? null,
            'dropoff_point_id' => $validated['dropoff_point_id'] ?? null,
        ]);

        $booking->load(['car', 'user']);

        return response()->json([
            'message' => 'Réservation créée avec succès.',
            'booking' => new BookingResource($booking),
        ], 201);
    }

    /**
     * PUT /api/admin/bookings/{booking}  (admin full update)
     */
    public function adminUpdate(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'start_date'     => 'sometimes|date',
            'end_date'       => 'sometimes|date|after_or_equal:start_date',
            'unit_number'    => 'sometimes|nullable|integer|min:1',
            'status'         => 'sometimes|in:pending,confirmed,active,completed,cancelled',
            'payment_status' => 'sometimes|in:Paid,Deposit Only,Unpaid',
            'amount'         => 'sometimes|nullable|numeric|min:0',
            'notes'          => 'nullable|string|max:2000',
            'pickup_point_id'  => 'nullable|exists:pickup_points,id',
            'dropoff_point_id' => 'nullable|exists:pickup_points,id',
        ]);

        // Re-validate unit availability if dates or unit_number changed
        $startDate = $validated['start_date'] ?? $booking->start_date->toDateString();
        $endDate   = $validated['end_date']   ?? $booking->end_date->toDateString();
        $newStatus = $validated['status']     ?? $booking->status;

        if (!in_array($newStatus, ['cancelled', 'completed']) &&
            (isset($validated['start_date']) || isset($validated['end_date']) || isset($validated['unit_number']))) {

            $car      = $booking->car ?? Car::findOrFail($booking->car_id);
            $quantity = max(1, $car->quantity);

            if (isset($validated['unit_number'])) {
                $requestedUnit = (int) $validated['unit_number'];
                if ($requestedUnit < 1 || $requestedUnit > $quantity) {
                    return response()->json([
                        'message' => "Unité #{$requestedUnit} invalide (1–{$quantity}).",
                    ], 422);
                }
                $overlap = Booking::where('car_id', $booking->car_id)
                    ->where('unit_number', $requestedUnit)
                    ->where('id', '!=', $booking->id)
                    ->whereNotIn('status', ['cancelled', 'completed'])
                    ->where('start_date', '<=', $endDate)
                    ->where('end_date',   '>=', $startDate)
                    ->exists();
                if ($overlap) {
                    $occupied = $this->occupiedUnits($booking->car_id, $startDate, $endDate, $booking->id);
                    return response()->json([
                        'message'        => "L'unité #{$requestedUnit} est déjà réservée sur cette période.",
                        'occupied_units' => $occupied,
                    ], 422);
                }
            } else {
                // Unit not changing — just verify old unit is still free for the new dates
                $unitNumber = $booking->unit_number ?? 1;
                $overlap = Booking::where('car_id', $booking->car_id)
                    ->where('unit_number', $unitNumber)
                    ->where('id', '!=', $booking->id)
                    ->whereNotIn('status', ['cancelled', 'completed'])
                    ->where('start_date', '<=', $endDate)
                    ->where('end_date',   '>=', $startDate)
                    ->exists();
                if ($overlap) {
                    // Try to re-assign to another free unit automatically
                    $freeUnit = $this->findAvailableUnit(
                        $booking->car_id, $startDate, $endDate, $booking->id, $quantity
                    );
                    if ($freeUnit === null) {
                        $occupied = $this->occupiedUnits($booking->car_id, $startDate, $endDate, $booking->id);
                        return response()->json([
                            'message'        => 'Toutes les unités sont déjà réservées sur cette nouvelle période.',
                            'occupied_units' => $occupied,
                        ], 422);
                    }
                    $validated['unit_number'] = $freeUnit;
                }
            }
        }

        $booking->update($validated);
        $booking->load(['car', 'user']);

        return response()->json([
            'message' => 'Réservation mise à jour.',
            'booking' => new BookingResource($booking),
        ]);
    }

    /**
     * PUT /api/bookings/{booking}/status  (admin)
     */
    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status'         => 'required|in:pending,confirmed,active,completed,cancelled',
            'payment_status' => 'sometimes|in:Paid,Deposit Only,Unpaid',
            'notes'          => 'nullable|string',
        ]);

        // Enforce valid status transitions
        $allowedTransitions = [
            'pending'   => ['confirmed', 'cancelled'],
            'confirmed' => ['active', 'cancelled'],
            'active'    => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => [],
        ];

        $currentStatus = $booking->status;
        $newStatus = $validated['status'];

        if ($currentStatus !== $newStatus && !in_array($newStatus, $allowedTransitions[$currentStatus] ?? [])) {
            return response()->json([
                'message' => "Cannot transition from '{$currentStatus}' to '{$newStatus}'.",
            ], 422);
        }

        $booking->update(['status' => $validated['status']]);
        $booking->load(['car', 'user']);

        return response()->json([
            'message' => 'Booking status updated.',
            'booking' => new BookingResource($booking),
        ]);
    }

    /**
     * DELETE /api/bookings/{booking}  (admin)
     */
    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();
        return response()->json(['message' => 'Booking deleted successfully.']);
    }

    /**
     * POST /api/bookings/{booking}/cancel  (client — own pending bookings)
     */
    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Only pending bookings can be cancelled.'], 422);
        }

        $booking->update(['status' => 'cancelled']);
        $booking->load(['car', 'user']);

        return response()->json([
            'message' => 'Booking cancelled.',
            'booking' => new BookingResource($booking),
        ]);
    }

    // ─── RESERVATION WORKFLOW ENDPOINTS ──────────────────────────────────────────────

    /**
     * POST /api/bookings/verify-identity
     *
     * Step 2 of the reservation workflow.
     * Receives extracted text fields from the client-side OCR scan, compares
     * first & last name between the National ID and Driver’s License, stores
     * document files, and marks the user’s KYC as Verified on success.
     */
    public function verifyIdentity(VerifyIdentityRequest $request): JsonResponse
    {
        $user = $request->user();

        // ── Name comparison (case-insensitive, trimmed) ───────────────────────
        // Names were extracted by client-side Tesseract.js OCR (free, in-browser).
        $norm = fn (string $s) => mb_strtolower(trim($s), 'UTF-8');

        $idFirst      = $norm($request->first_name_from_id);
        $idLast       = $norm($request->last_name_from_id);
        $licenseFirst = $norm($request->first_name_from_license);
        $licenseLast  = $norm($request->last_name_from_license);

        if ($idFirst !== $licenseFirst || $idLast !== $licenseLast) {
            return response()->json([
                'message' => 'Le prénom et le nom de la CIN ne correspondent pas au permis de conduire. '
                           . 'Veuillez vérifier vos documents.',
                'details' => [
                    'id_name'      => $request->first_name_from_id . ' ' . $request->last_name_from_id,
                    'license_name' => $request->first_name_from_license . ' ' . $request->last_name_from_license,
                ],
            ], 422);
        }

        // ── Store document files (optional) ──────────────────────────────────
        $docPaths = [];
        $docFields = [
            'doc_id_front' => 'doc_id_front',
            'doc_id_back'  => 'doc_id_back',
            'doc_license'  => 'doc_license',
            'client_photo' => 'avatar',
        ];
        foreach ($docFields as $inputField => $modelField) {
            if ($request->hasFile($inputField)) {
                $path = $request->file($inputField)
                    ->store("users/{$user->id}/kyc", 'public');
                $docPaths[$modelField] = $path;
            }
        }

        // ── Update user profile ───────────────────────────────────────────────
        $fullName = $request->first_name_from_id . ' ' . $request->last_name_from_id;

        $user->update(array_merge([
            'name'                  => $fullName,
            'national_id'           => $request->national_id_number,
            'driver_license_number' => $request->driver_license_number,
            'phone'                 => $request->phone,
            'kyc_status'            => 'Verified',
        ], $docPaths));

        return response()->json([
            'verified'               => true,
            'first_name'             => $request->first_name_from_id,
            'last_name'              => $request->last_name_from_id,
            'national_id_number'     => $request->national_id_number,
            'driver_license_number'  => $request->driver_license_number,
            'message'                => 'Identité vérifiée avec succès.',
        ]);
    }

    /**
     * POST /api/bookings/calculate-cost
     *
     * Step 3 of the reservation workflow.
     * Pure cost calculation — no database write.
     * Returns a full breakdown including tax and security deposit.
     */
    public function calculateCost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'     => 'required|exists:cars,id',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $car   = Car::findOrFail($validated['car_id']);
        $start = Carbon::parse($validated['start_date']);
        $end   = Carbon::parse($validated['end_date']);
        $days  = $start->diffInDays($end) + 1; // inclusive

        $daily    = (float) $car->daily_price;
        $subtotal = $days * $daily;

        $taxRate  = (int) Setting::get('tax_rate', 20);
        $depRate  = (int) Setting::get('security_deposit_rate', 20);

        $taxAmount = round($subtotal * $taxRate / 100, 2);
        $deposit   = round($subtotal * $depRate / 100, 2);
        $total     = round($subtotal + $taxAmount + $deposit, 2);

        return response()->json([
            'days'                    => $days,
            'daily_price'             => $daily,
            'subtotal'                => round($subtotal, 2),
            'tax_rate'                => $taxRate,
            'tax_amount'              => $taxAmount,
            'security_deposit_rate'   => $depRate,
            'security_deposit'        => $deposit,
            'total'                   => $total,
            'car'                     => [
                'id'   => $car->id,
                'name' => $car->make . ' ' . $car->model,
            ],
        ]);
    }

    /**
     * POST /api/bookings/finalize
     *
     * Step 4 of the reservation workflow.
     * Performs full server-side validation before creating the confirmed booking:
     *   1. Vehicle availability
     *   2. KYC verified
     *   3. Mandatory profile fields present
     *   4. GPS coordinates provided
     * On success, creates booking with status=confirmed and dispatches confirmation email.
     */
    public function finalizeReservation(FinalizeReservationRequest $request): JsonResponse
    {
        $user = $request->user();

        // ── 1. KYC check ──
        if ($user->kyc_status !== 'Verified') {
            return response()->json([
                'message' => 'Votre identité doit être vérifiée avant de finaliser une réservation. Veuillez compléter l’étape 2.',
            ], 422);
        }

        // ── 2. Mandatory profile fields ──
        $missing = [];
        if (empty($user->name))                   $missing[] = 'name';
        if (empty($user->national_id))             $missing[] = 'national_id';
        if (empty($user->driver_license_number))   $missing[] = 'driver_license_number';
        if (empty($user->email))                   $missing[] = 'email';
        if (empty($user->phone))                   $missing[] = 'phone';

        if (! empty($missing)) {
            return response()->json([
                'message' => 'Informations de profil incomplètes : ' . implode(', ', $missing),
                'missing_fields' => $missing,
            ], 422);
        }

        $car      = Car::findOrFail($request->car_id);
        $start    = Carbon::parse($request->start_date);
        $end      = Carbon::parse($request->end_date);
        $quantity = max(1, $car->quantity);

        // ── 3. Availability check ──
        if ($car->availability === 'unavailable') {
            return response()->json(['message' => 'Ce véhicule est actuellement marqué comme indisponible.'], 422);
        }

        $unitNumber = $this->findAvailableUnit(
            $car->id,
            $start->toDateString(),
            $end->toDateString(),
            null,
            $quantity
        );

        if ($unitNumber === null) {
            $suggested = $this->findNextAvailableSlot(
                $car->id,
                $start->toDateString(),
                $end->toDateString(),
                $quantity
            );
            return response()->json([
                'message'        => 'Toutes les unités sont réservées pour cette période.',
                'suggested_slot' => $suggested,
            ], 422);
        }

        // ── 4. Cost calculation ──
        $days     = $start->diffInDays($end) + 1;
        $daily    = (float) $car->daily_price;
        $subtotal = $days * $daily;
        $taxRate  = (int) Setting::get('tax_rate', 20);
        $depRate  = (int) Setting::get('security_deposit_rate', 20);
        $total    = round($subtotal * (1 + $taxRate / 100 + $depRate / 100), 2);

        // ── 5. Create confirmed booking ──
        $booking = Booking::create([
            'user_id'           => $user->id,
            'car_id'            => $car->id,
            'unit_number'       => $unitNumber,
            'start_date'        => $start->toDateString(),
            'end_date'          => $end->toDateString(),
            'status'            => 'confirmed',
            'payment_status'    => 'Unpaid',
            'amount'            => $total,
            'notes'             => $request->notes,
            'pickup_latitude'   => $request->pickup_latitude,
            'pickup_longitude'  => $request->pickup_longitude,
            'pickup_address'    => $request->pickup_address,
        ]);

        $booking->load(['car', 'user']);

        // ── 6. Send confirmation email ──
        try {
            Mail::to($user->email)->send(new ReservationConfirmationMail($booking));
        } catch (\Throwable $e) {
            // Log but don’t fail the response — booking is already saved
            logger()->error('ReservationConfirmationMail failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Réservation confirmée avec succès. Un email de confirmation vous a été envoyé.',
            'booking' => new BookingResource($booking),
            'cost' => [
                'days'              => $days,
                'daily_price'       => $daily,
                'subtotal'          => round($subtotal, 2),
                'tax_rate'          => $taxRate,
                'security_deposit_rate' => $depRate,
                'total'             => $total,
            ],
        ], 201);
    }
}
