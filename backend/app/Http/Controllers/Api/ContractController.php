<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    /**
     * GET /api/admin/contracts
     * Paginated list with search & status filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Contract::with(['booking', 'user', 'car']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('contract_number', 'like', "%{$s}%")
                  ->orWhere('client_name', 'like', "%{$s}%")
                  ->orWhere('vehicle_name', 'like', "%{$s}%")
                  ->orWhere('vehicle_plate', 'like', "%{$s}%");
            });
        }

        if ($request->filled('from')) {
            $query->where('start_date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('end_date', '<=', $request->to);
        }

        $contracts = $query->latest()->paginate($request->get('per_page', 100));

        return response()->json($contracts);
    }

    /**
     * GET /api/admin/contracts/{contract}
     */
    public function show(Contract $contract): JsonResponse
    {
        $contract->load(['booking.car', 'booking.user', 'user', 'car', 'invoices']);

        return response()->json(['contract' => $contract]);
    }

    /**
     * POST /api/admin/contracts
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id'             => 'required|exists:bookings,id',
            'client_name'            => 'required|string|max:255',
            'client_phone'           => 'nullable|string|max:50',
            'client_email'           => 'nullable|email|max:255',
            'client_id_number'       => 'nullable|string|max:100',
            'client_license_number'  => 'nullable|string|max:100',
            'vehicle_name'           => 'required|string|max:255',
            'vehicle_plate'          => 'required|string|max:50',
            'unit_number'            => 'nullable|integer',
            'start_date'             => 'required|date',
            'end_date'               => 'required|date|after_or_equal:start_date',
            'daily_rate'             => 'nullable|numeric|min:0',
            'total_amount'           => 'nullable|numeric|min:0',
            'deposit_amount'         => 'nullable|numeric|min:0',
            'currency'               => 'nullable|string|max:10',
            'insurance_type'         => 'nullable|string|max:255',
            'mileage_start'          => 'nullable|integer|min:0',
            'fuel_level_start'       => 'nullable|string|max:50',
            'condition_start'        => 'nullable|array',
            'status'                 => 'sometimes|in:draft,active,completed,cancelled',
            'signature_client_start' => 'nullable|string',
            'signature_agent_start'  => 'nullable|string',
            'signature_city'         => 'nullable|string|max:100',
            'extra_charges'          => 'nullable|array',
            'notes'                  => 'nullable|string',
            'conditions_text'        => 'nullable|string',
        ]);

        $booking = Booking::with(['user', 'car'])->findOrFail($validated['booking_id']);
        $validated['user_id'] = $booking->user_id;
        $validated['car_id']  = $booking->car_id;

        $contract = Contract::create($validated);
        $contract->load(['booking', 'user', 'car']);

        return response()->json([
            'message'  => 'Contract created successfully.',
            'contract' => $contract,
        ], 201);
    }

    /**
     * PUT /api/admin/contracts/{contract}
     */
    public function update(Request $request, Contract $contract): JsonResponse
    {
        $validated = $request->validate([
            'client_name'            => 'sometimes|string|max:255',
            'client_phone'           => 'nullable|string|max:50',
            'client_email'           => 'nullable|email|max:255',
            'client_id_number'       => 'nullable|string|max:100',
            'client_license_number'  => 'nullable|string|max:100',
            'vehicle_name'           => 'sometimes|string|max:255',
            'vehicle_plate'          => 'sometimes|string|max:50',
            'unit_number'            => 'nullable|integer',
            'start_date'             => 'sometimes|date',
            'end_date'               => 'sometimes|date',
            'daily_rate'             => 'nullable|numeric|min:0',
            'total_amount'           => 'nullable|numeric|min:0',
            'deposit_amount'         => 'nullable|numeric|min:0',
            'currency'               => 'nullable|string|max:10',
            'insurance_type'         => 'nullable|string|max:255',
            'mileage_start'          => 'nullable|integer|min:0',
            'mileage_end'            => 'nullable|integer|min:0',
            'fuel_level_start'       => 'nullable|string|max:50',
            'fuel_level_end'         => 'nullable|string|max:50',
            'condition_start'        => 'nullable|array',
            'condition_end'          => 'nullable|array',
            'status'                 => 'sometimes|in:draft,active,completed,cancelled',
            'signature_client_start' => 'nullable|string',
            'signature_agent_start'  => 'nullable|string',
            'signature_client_end'   => 'nullable|string',
            'signature_agent_end'    => 'nullable|string',
            'signature_city'         => 'nullable|string|max:100',
            'signed_at'              => 'nullable|date',
            'extra_charges'          => 'nullable|array',
            'notes'                  => 'nullable|string',
            'conditions_text'        => 'nullable|string',
        ]);

        $contract->update($validated);
        $contract->load(['booking', 'user', 'car', 'invoices']);

        return response()->json([
            'message'  => 'Contract updated successfully.',
            'contract' => $contract,
        ]);
    }

    /**
     * DELETE /api/admin/contracts/{contract}
     */
    public function destroy(Contract $contract): JsonResponse
    {
        $contract->delete();

        return response()->json(['message' => 'Contract deleted successfully.']);
    }

    /**
     * POST /api/admin/contracts/from-booking/{booking}
     * Smart-create: auto-populate contract from a booking. Idempotent.
     */
    public function createFromBooking(Booking $booking): JsonResponse
    {
        // Return existing if already generated
        $existing = Contract::where('booking_id', $booking->id)->first();
        if ($existing) {
            $existing->load(['booking', 'user', 'car', 'invoices']);
            return response()->json([
                'message'  => 'Contract already exists for this booking.',
                'contract' => $existing,
            ]);
        }

        $booking->load(['user', 'car']);

        $days = max(1, $booking->start_date->diffInDays($booking->end_date));
        $dailyRate = $days > 0 ? round($booking->amount / $days, 2) : $booking->amount;

        $contract = Contract::create([
            'booking_id'              => $booking->id,
            'user_id'                 => $booking->user_id,
            'car_id'                  => $booking->car_id,
            'client_name'             => $booking->user->name ?? '',
            'client_phone'            => $booking->user->phone ?? '',
            'client_email'            => $booking->user->email ?? '',
            'client_id_number'        => $booking->user->national_id ?? '',
            'client_date_of_birth'    => $booking->user->date_of_birth ?? null,
            'client_profession'       => $booking->user->profession ?? null,
            'client_license_number'   => $booking->user->driver_license_number ?? '',
            'client_license_issued_at'=> $booking->user->driver_license_issued_at ?? null,
            'client_license_expiry'   => $booking->user->driver_license_expiry_date ?? null,
            'client_passport_number'  => $booking->user->passport_number ?? null,
            'client_passport_issued_at' => $booking->user->passport_issued_at ?? null,
            'client_passport_issued_date' => $booking->user->passport_issued_date ?? null,
            'client_address'          => $booking->user->address_morocco ?? null,
            'client_address_abroad'   => $booking->user->address_abroad ?? null,
            'vehicle_name'            => $booking->car->full_name
                                          ?? trim(($booking->car->year ?? '') . ' ' . ($booking->car->make ?? '') . ' ' . ($booking->car->model ?? '')),
            'vehicle_plate'           => $this->unitPlate($booking),
            'vehicle_color'           => $booking->car->color ?? null,
            'vehicle_vin'             => $booking->car->vin ?? null,
            'unit_number'             => $booking->unit_number,
            'start_date'              => $booking->start_date,
            'end_date'                => $booking->end_date,
            'daily_rate'              => $dailyRate,
            'total_amount'            => $booking->amount,
            'deposit_amount'          => 0,
            'booking_payment_status'  => $booking->payment_status ?? null,
            'insurance_type'          => 'Tous Risques',
            'insurance_deductible'    => 2000,
            'status'                  => 'draft',
        ]);

        $contract->load(['booking', 'user', 'car']);

        return response()->json([
            'message'  => 'Contract created from booking.',
            'contract' => $contract,
        ], 201);
    }

    /**
     * GET /api/admin/contracts/{contract}/pdf
     */
    public function downloadPdf(Contract $contract): \Illuminate\Http\Response
    {
        $contract->load(['booking', 'user', 'car']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.contract_arabic', compact('contract'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("contrat-rlv-{$contract->contract_number}.pdf");
    }

    /**
     * GET /api/admin/contracts/{contract}/pdf-arabic
     *
     * Uses mPDF instead of DomPDF because mPDF has native Arabic text shaping
     * (connected letters, RTL, bidirectional text). DomPDF renders Arabic as
     * disconnected, reversed letters.
     */
    public function downloadArabicPdf(Contract $contract): \Illuminate\Http\Response
    {
        $filename = "contrat-rlv-{$contract->contract_number}.pdf";

        return new \Illuminate\Http\Response($this->renderArabicPdf($contract, $filename), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * GET /api/admin/contracts/{contract}/arabic-preview
     */
    public function previewArabic(Contract $contract): \Illuminate\Http\Response
    {
        $contract->load(['booking', 'user', 'car']);

        $filename = "contrat-rlv-{$contract->contract_number}.pdf";

        return new \Illuminate\Http\Response($this->renderArabicPdf($contract, $filename), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$filename}\"",
        ]);
    }

    private function renderArabicPdf(Contract $contract, string $filename): string
    {
        // Render the Blade template to HTML without CSS @page; mPDF gets page
        // size and margins from its own configuration below.
        $html = view('pdf.contract_arabic', [
            'contract' => $contract,
            'forMpdf'  => true,
        ])->render();

        // Create mPDF instance with Arabic support
        $mpdf = new \Mpdf\Mpdf([
            'mode'             => 'utf-8',
            'format'           => 'A4',
            'orientation'      => 'P',
            'tempDir'          => storage_path('app/mpdf-tmp'),
            'autoArabic'       => true,
            'autoLangToFont'   => true,
            'default_font'     => 'dejavusans',
            'margin_left'      => 0,
            'margin_right'     => 0,
            'margin_top'       => 0,
            'margin_bottom'    => 0,
        ]);

        $mpdf->SetTitle("Contrat de Location {$contract->contract_number}");
        $mpdf->SetDisplayMode('fullpage');

        // Suppress non-fatal "Undefined array key -1" warning in mPDF table rendering
        @$mpdf->WriteHTML($html);

        return $mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN);
    }

    /**
     * Resolve the plate for the specific unit booked.
     */
    private function unitPlate(\App\Models\Booking $booking): string
    {
        $car = $booking->car;
        if (!$car) return '';

        // If the car has per-unit plates stored as JSON array, pick the right one
        $unitPlates = $car->unit_plates ?? [];
        $unit = ($booking->unit_number ?? 1) - 1; // 0-indexed
        if (!empty($unitPlates) && isset($unitPlates[$unit])) {
            return $unitPlates[$unit];
        }

        return $car->plate ?? '';
    }
}
