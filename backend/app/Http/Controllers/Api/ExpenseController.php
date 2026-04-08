<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    /**
     * GET /api/admin/expenses
     * Paginated list with search, category, status, and date filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::with(['car', 'creator']);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhere('reference', 'like', "%{$s}%")
                  ->orWhere('paid_by', 'like', "%{$s}%");
            });
        }

        if ($request->filled('from')) {
            $query->where('date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('date', '<=', $request->to);
        }

        $expenses = $query->latest('date')->paginate($request->get('per_page', 100));

        // Summary stats
        $statsQuery = Expense::query();
        if ($request->filled('from')) $statsQuery->where('date', '>=', $request->from);
        if ($request->filled('to'))   $statsQuery->where('date', '<=', $request->to);

        $byCategory = (clone $statsQuery)->select('category', DB::raw('SUM(amount) as total'))
            ->where('status', '!=', 'cancelled')
            ->groupBy('category')
            ->pluck('total', 'category');

        $totalPaid    = (clone $statsQuery)->where('status', 'paid')->sum('amount');
        $totalPending = (clone $statsQuery)->where('status', 'pending')->sum('amount');

        return response()->json([
            'data'         => $expenses->items(),
            'meta'         => [
                'total'        => $expenses->total(),
                'current_page' => $expenses->currentPage(),
                'last_page'    => $expenses->lastPage(),
                'per_page'     => $expenses->perPage(),
            ],
            'stats' => [
                'total_paid'    => round($totalPaid, 2),
                'total_pending' => round($totalPending, 2),
                'by_category'   => $byCategory,
            ],
        ]);
    }

    /**
     * GET /api/admin/expenses/{expense}
     */
    public function show(Expense $expense): JsonResponse
    {
        $expense->load(['car', 'creator']);

        return response()->json(['expense' => $expense]);
    }

    /**
     * POST /api/admin/expenses
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'category'       => 'required|in:salary,vehicle_inspection,maintenance,insurance,fuel,rent,utilities,marketing,tax,fine,other',
            'amount'         => 'required|numeric|min:0',
            'date'           => 'required|date',
            'description'    => 'nullable|string',
            'reference'      => 'nullable|string|max:100',
            'paid_by'        => 'nullable|string|max:255',
            'payment_method' => 'nullable|in:cash,card,transfer,check',
            'car_id'         => 'nullable|exists:cars,id',
            'status'         => 'sometimes|in:paid,pending,cancelled',
        ]);

        $validated['created_by'] = $request->user()?->id;

        $expense = Expense::create($validated);
        $expense->load(['car', 'creator']);

        return response()->json([
            'message' => 'Dépense enregistrée avec succès.',
            'expense' => $expense,
        ], 201);
    }

    /**
     * PUT /api/admin/expenses/{expense}
     */
    public function update(Request $request, Expense $expense): JsonResponse
    {
        $validated = $request->validate([
            'title'          => 'sometimes|string|max:255',
            'category'       => 'sometimes|in:salary,vehicle_inspection,maintenance,insurance,fuel,rent,utilities,marketing,tax,fine,other',
            'amount'         => 'sometimes|numeric|min:0',
            'date'           => 'sometimes|date',
            'description'    => 'nullable|string',
            'reference'      => 'nullable|string|max:100',
            'paid_by'        => 'nullable|string|max:255',
            'payment_method' => 'nullable|in:cash,card,transfer,check',
            'car_id'         => 'nullable|exists:cars,id',
            'status'         => 'sometimes|in:paid,pending,cancelled',
        ]);

        $expense->update($validated);
        $expense->load(['car', 'creator']);

        return response()->json([
            'message' => 'Dépense mise à jour avec succès.',
            'expense' => $expense,
        ]);
    }

    /**
     * DELETE /api/admin/expenses/{expense}
     */
    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json(['message' => 'Dépense supprimée avec succès.']);
    }

    /**
     * GET /api/admin/expenses/summary
     * Monthly totals per category for the last 6 months — used by charts.
     */
    public function summary(Request $request): JsonResponse
    {
        $months = 6;
        $from   = now()->subMonths($months - 1)->startOfMonth()->toDateString();

        $rows = Expense::select(
                DB::raw("DATE_FORMAT(date, '%Y-%m') as month"),
                'category',
                DB::raw('SUM(amount) as total')
            )
            ->where('date', '>=', $from)
            ->where('status', '!=', 'cancelled')
            ->groupBy('month', 'category')
            ->orderBy('month')
            ->get();

        return response()->json(['summary' => $rows]);
    }
}
