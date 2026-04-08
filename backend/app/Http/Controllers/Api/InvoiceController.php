<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * GET /api/admin/invoices
     * Paginated list with search, status & date filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['contract', 'booking', 'user']);

        // Auto-detect overdue invoices
        Invoice::where('status', 'sent')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->update(['status' => 'overdue']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('invoice_number', 'like', "%{$s}%")
                  ->orWhere('client_name', 'like', "%{$s}%");
            });
        }

        if ($request->filled('issue_from')) {
            $query->where('issue_date', '>=', $request->issue_from);
        }
        if ($request->filled('issue_to')) {
            $query->where('issue_date', '<=', $request->issue_to);
        }
        if ($request->filled('due_from')) {
            $query->where('due_date', '>=', $request->due_from);
        }
        if ($request->filled('due_to')) {
            $query->where('due_date', '<=', $request->due_to);
        }

        $invoices = $query->latest()->paginate($request->get('per_page', 100));

        return response()->json($invoices);
    }

    /**
     * GET /api/admin/invoices/{invoice}
     */
    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['contract', 'booking.car', 'booking.user', 'user']);

        return response()->json(['invoice' => $invoice]);
    }

    /**
     * POST /api/admin/invoices
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id'     => 'nullable|exists:contracts,id',
            'booking_id'      => 'nullable|exists:bookings,id',
            'user_id'         => 'required|exists:users,id',
            'client_name'     => 'required|string|max:255',
            'client_email'    => 'nullable|email|max:255',
            'client_phone'    => 'nullable|string|max:50',
            'client_address'  => 'nullable|string|max:500',
            'items'           => 'required|array|min:1',
            'items.*.label'   => 'required|string|max:255',
            'items.*.quantity'  => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate'  => 'nullable|numeric|min:0|max:100',
            'tax_rate'        => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'currency'        => 'nullable|string|max:10',
            'status'          => 'sometimes|in:draft,sent,paid,overdue,cancelled',
            'payment_method'  => 'nullable|in:cash,card,transfer,check',
            'issue_date'      => 'nullable|date',
            'due_date'        => 'nullable|date',
            'notes'           => 'nullable|string',
        ]);

        $validated = $this->recalculate($validated);
        $validated['issue_date'] = $validated['issue_date'] ?? now()->toDateString();

        $invoice = Invoice::create($validated);
        $invoice->load(['contract', 'booking', 'user']);

        return response()->json([
            'message' => 'Invoice created successfully.',
            'invoice' => $invoice,
        ], 201);
    }

    /**
     * PUT /api/admin/invoices/{invoice}
     */
    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'client_name'     => 'sometimes|string|max:255',
            'client_email'    => 'nullable|email|max:255',
            'client_phone'    => 'nullable|string|max:50',
            'client_address'  => 'nullable|string|max:500',
            'items'           => 'sometimes|array|min:1',
            'items.*.label'   => 'required_with:items|string|max:255',
            'items.*.quantity'  => 'required_with:items|numeric|min:0',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'items.*.tax_rate'  => 'nullable|numeric|min:0|max:100',
            'tax_rate'        => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'currency'        => 'nullable|string|max:10',
            'status'          => 'sometimes|in:draft,sent,paid,overdue,cancelled',
            'payment_method'  => 'nullable|in:cash,card,transfer,check',
            'issue_date'      => 'nullable|date',
            'due_date'        => 'nullable|date',
            'notes'           => 'nullable|string',
        ]);

        if (isset($validated['items'])) {
            $validated = $this->recalculate($validated);
        }

        $invoice->update($validated);
        $invoice->load(['contract', 'booking', 'user']);

        return response()->json([
            'message' => 'Invoice updated successfully.',
            'invoice' => $invoice,
        ]);
    }

    /**
     * DELETE /api/admin/invoices/{invoice}
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully.']);
    }

    /**
     * POST /api/admin/invoices/from-contract/{contract}
     * Auto-generate invoice from a contract. Idempotent.
     */
    public function createFromContract(Contract $contract): JsonResponse
    {
        $existing = Invoice::where('contract_id', $contract->id)->first();
        if (!$existing && $contract->booking_id) {
            // Link any existing unlinked invoice for the same booking
            $unlinked = Invoice::where('booking_id', $contract->booking_id)
                ->whereNull('contract_id')
                ->latest()
                ->first();
            if ($unlinked) {
                $unlinked->update(['contract_id' => $contract->id]);
                $unlinked->load(['contract', 'booking', 'user']);
                return response()->json([
                    'message' => 'Invoice linked to contract.',
                    'invoice' => $unlinked,
                ]);
            }
        }
        if ($existing) {
            $existing->load(['contract', 'booking', 'user']);
            return response()->json([
                'message' => 'Invoice already exists for this contract.',
                'invoice' => $existing,
            ]);
        }

        $contract->load(['booking', 'user']);
        $days = max(1, $contract->start_date->diffInDays($contract->end_date));

        $items = [
            [
                'label'      => "Location véhicule — {$contract->vehicle_name} ({$days} jours)",
                'quantity'   => $days,
                'unit_price' => (float) $contract->daily_rate,
                'tax_rate'   => 20,
                'line_total' => round($days * (float) $contract->daily_rate, 2),
            ],
        ];

        // Add extra charges as separate line items
        if (is_array($contract->extra_charges)) {
            foreach ($contract->extra_charges as $charge) {
                $label = $charge['label'] ?? 'Frais supplémentaire';
                $amount = (float) ($charge['amount'] ?? 0);
                if ($amount > 0) {
                    $items[] = [
                        'label'      => $label,
                        'quantity'   => 1,
                        'unit_price' => $amount,
                        'tax_rate'   => 20,
                        'line_total' => $amount,
                    ];
                }
            }
        }

        $data = [
            'contract_id'    => $contract->id,
            'booking_id'     => $contract->booking_id,
            'user_id'        => $contract->user_id,
            'client_name'    => $contract->client_name,
            'client_email'   => $contract->client_email,
            'client_phone'   => $contract->client_phone,
            'items'          => $items,
            'tax_rate'       => 20,
            'discount_amount' => 0,
            'issue_date'     => now()->toDateString(),
            'due_date'       => now()->addDays(7)->toDateString(),
            'status'         => 'sent',
        ];

        $data = $this->recalculate($data);

        $invoice = Invoice::create($data);
        $invoice->load(['contract', 'booking', 'user']);

        return response()->json([
            'message' => 'Invoice generated from contract.',
            'invoice' => $invoice,
        ], 201);
    }

    /**
     * PATCH /api/admin/invoices/{invoice}/mark-paid
     */
    public function markPaid(Request $request, Invoice $invoice): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|in:cash,card,transfer,check',
        ]);

        $invoice->update([
            'status'         => 'paid',
            'payment_method' => $request->payment_method,
            'paid_at'        => now(),
        ]);

        $invoice->load(['contract', 'booking', 'user']);

        return response()->json([
            'message' => 'Invoice marked as paid.',
            'invoice' => $invoice,
        ]);
    }

    /**
     * GET /api/admin/invoices/{invoice}/pdf
     */
    public function downloadPdf(Invoice $invoice): \Illuminate\Http\Response
    {
        $invoice->load(['contract', 'booking.car', 'user']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', compact('invoice'));

        return $pdf->download("facture-{$invoice->invoice_number}.pdf");
    }

    /**
     * Recalculate totals from line items.
     */
    private function recalculate(array $data): array
    {
        $items = $data['items'] ?? [];
        $subtotal = 0;

        foreach ($items as &$item) {
            $qty       = (float) ($item['quantity'] ?? 0);
            $unitPrice = (float) ($item['unit_price'] ?? 0);
            $item['line_total'] = round($qty * $unitPrice, 2);
            $subtotal += $item['line_total'];
        }

        $data['items']    = $items;
        $data['subtotal'] = round($subtotal, 2);

        $discount  = (float) ($data['discount_amount'] ?? 0);
        $taxRate   = (float) ($data['tax_rate'] ?? 20);
        $taxable   = max(0, $subtotal - $discount);
        $taxAmount = round($taxable * $taxRate / 100, 2);

        $data['tax_amount']      = $taxAmount;
        $data['discount_amount'] = round($discount, 2);
        $data['total']           = round($taxable + $taxAmount, 2);

        return $data;
    }
}
