<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * GET /api/admin/settings
     * Return all settings, optionally grouped.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Setting::query();

        if ($request->filled('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->get()->keyBy('key')->map(fn ($s) => match ($s->type) {
            'boolean' => (bool) $s->value,
            'integer' => (int)  $s->value,
            'json'    => json_decode($s->value, true),
            default   => $s->value,
        });

        return response()->json(['settings' => $settings]);
    }

    /**
     * PUT /api/admin/settings
     * Bulk-update multiple settings at once.
     * Body: { "currency": "EUR", "booking_deposit": 20 }
     */
    public function update(Request $request): JsonResponse
    {
        $allowedKeys = [
            'currency', 'tax_rate', 'security_deposit_rate', 'booking_deposit',
            'company_name', 'company_address', 'company_phone', 'company_email',
            'default_language', 'timezone', 'date_format',
        ];

        $data = collect($request->all())->only($allowedKeys);

        foreach ($data as $key => $value) {
            $existing = Setting::where('key', $key)->first();
            if ($existing) {
                $existing->update([
                    'value' => is_array($value) ? json_encode($value) : (string) $value,
                ]);
            }
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }
}
