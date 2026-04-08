<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\DemoCredentialsMail;
use App\Models\DemoAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class DemoController extends Controller
{
    // ── GET /api/admin/demo ──────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        $demos = DemoAccount::orderByDesc('created_at')
            ->get()
            ->map(fn (DemoAccount $d) => $d->toFrontend());

        return response()->json(['data' => $demos]);
    }

    // ── POST /api/admin/demo ─────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'email'       => 'required|email|max:255',
            'duration'    => 'required|integer|min:1|max:365',
        ]);

        $days      = (int) $validated['duration'];
        $accessKey = 'demo_' . Str::lower(Str::random(6));

        $plan = match (true) {
            $days === 14 => '2 Weeks',
            $days === 30 => '1 Month',
            $days === 7  => '7 Days',
            default      => 'Custom (' . $days . ' j)',
        };

        $demo = DemoAccount::create([
            'client_name' => $validated['client_name'],
            'email'       => $validated['email'],
            'plan'        => $plan,
            'expires_at'  => now()->addDays($days)->toDateString(),
            'access_key'  => $accessKey,
        ]);

        // Create / update a User so the demo agency can log into the admin dashboard
        $user = User::firstOrNew(['email' => $validated['email']]);
        $user->name       = $validated['client_name'];
        $user->password   = Hash::make($accessKey);
        $user->status     = 'Active';
        $user->kyc_status = 'Verified';
        $user->role       = 'demo_admin'; // demo agencies get limited admin access
        $user->save();

        $emailSent = $this->sendEmail($demo);

        return response()->json([
            'message'    => $emailSent
                ? 'Compte démo créé — identifiants envoyés par email.'
                : 'Compte démo créé — email non envoyé (vérifier RESEND_KEY dans .env).',
            'email_sent' => $emailSent,
            'data'       => $demo->toFrontend(),
        ], 201);
    }

    // ── POST /api/admin/demo/{demo}/resend ───────────────────────────────────
    public function resend(DemoAccount $demo): JsonResponse
    {
        $emailSent = $this->sendEmail($demo);

        return response()->json([
            'message'    => $emailSent
                ? 'Email renvoyé avec succès.'
                : 'Email non envoyé (vérifier RESEND_KEY dans .env).',
            'email_sent' => $emailSent,
        ]);
    }

    // ── DELETE /api/admin/demo/{demo} ────────────────────────────────────────
    public function destroy(DemoAccount $demo): JsonResponse
    {
        $demo->delete();

        return response()->json(['message' => 'Compte démo supprimé.']);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Send demo credentials email via Resend (falls back silently if not configured).
     * Returns true on success, false on failure.
     */
    private function sendEmail(DemoAccount $demo): bool
    {
        $fromAddress = config('mail.demo_from.address');
        $fromName    = config('mail.demo_from.name');
        $loginUrl    = rtrim(config('app.url'), '/') . '/login';

        try {
            Mail::mailer('resend')
                ->to($demo->email, $demo->client_name)
                ->send(new DemoCredentialsMail($demo, $loginUrl, $fromAddress, $fromName));

            return true;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('[DemoController] Email failed: ' . $e->getMessage(), [
                'demo_id' => $demo->id,
                'email'   => $demo->email,
            ]);

            return false;
        }
    }
}
