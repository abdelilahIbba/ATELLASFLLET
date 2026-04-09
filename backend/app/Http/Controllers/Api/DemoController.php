<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\DemoCredentialsMail;
use App\Models\DemoAccount;
use App\Models\User;
use App\Services\DemoSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class DemoController extends Controller
{
    // -- GET /api/admin/demo
    public function index(): JsonResponse
    {
        $demos = DemoAccount::orderByDesc('created_at')
            ->get()
            ->map(fn (DemoAccount $d) => $d->toFrontend());

        return response()->json(['data' => $demos]);
    }

    // -- POST /api/admin/demo
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name'   => 'required|string|max:255',
            'email'         => 'required|email|max:255',
            'duration'      => 'required|integer|min:1|max:365',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        $days        = (int) $validated['duration'];
        $accessKey   = 'demo_' . Str::lower(Str::random(6));
        $permissions = $validated['permissions'] ?? DemoAccount::defaultPermissions();

        $plan = match (true) {
            $days === 3  => '3 Jours',
            $days === 7  => '7 Jours',
            $days === 14 => '2 Semaines',
            $days === 30 => '1 Mois',
            default      => 'Personnalise (' . $days . ' j)',
        };

        $expiresAt = now()->addDays($days)->toDateString();

        $demo = DemoAccount::create([
            'client_name' => $validated['client_name'],
            'email'       => $validated['email'],
            'plan'        => $plan,
            'expires_at'  => $expiresAt,
            'access_key'  => $accessKey,
            'permissions' => $permissions,
        ]);

        $user = User::firstOrNew(['email' => $validated['email']]);
        $user->name             = $validated['client_name'];
        $user->password         = Hash::make($accessKey);
        $user->status           = 'Active';
        $user->kyc_status       = 'Verified';
        $user->role             = 'demo_admin';
        $user->demo_permissions = $permissions;
        $user->demo_expires_at  = $expiresAt;
        $user->demo_account_id  = $demo->id;
        $user->save();

        // Seed sample data for this demo tenant
        (new DemoSeeder)->seed($demo);

        $emailSent = $this->sendEmail($demo);

        return response()->json([
            'message'    => $emailSent ? 'Compte demo cree.' : 'Compte demo cree — email non envoye.',
            'email_sent' => $emailSent,
            'data'       => $demo->toFrontend(),
        ], 201);
    }

    // -- POST /api/admin/demo/{demo}/resend
    public function resend(DemoAccount $demo): JsonResponse
    {
        $emailSent = $this->sendEmail($demo);
        return response()->json([
            'message'    => $emailSent ? 'Email renvoye.' : 'Email non envoye.',
            'email_sent' => $emailSent,
        ]);
    }

    // -- POST /api/admin/demo/{demo}/extend
    public function extend(Request $request, DemoAccount $demo): JsonResponse
    {
        $validated = $request->validate(['days' => 'required|integer|min:1|max:365']);
        $days      = (int) $validated['days'];
        $base      = $demo->expires_at->isPast() ? now() : $demo->expires_at;
        $newExpiry = $base->addDays($days)->toDateString();

        $demo->update(['expires_at' => $newExpiry]);
        User::where('email', $demo->email)->where('role', 'demo_admin')->update(['demo_expires_at' => $newExpiry]);

        return response()->json(['message' => "Periode etendue de {$days} jour(s).", 'data' => $demo->fresh()->toFrontend()]);
    }

    // -- PUT /api/admin/demo/{demo}/permissions
    public function updatePermissions(Request $request, DemoAccount $demo): JsonResponse
    {
        $validated = $request->validate(['permissions' => 'required|array|min:1', 'permissions.*' => 'string']);
        $permissions = $validated['permissions'];

        $demo->update(['permissions' => $permissions]);
        User::where('email', $demo->email)->where('role', 'demo_admin')->update(['demo_permissions' => json_encode($permissions)]);

        return response()->json(['message' => 'Permissions mises a jour.', 'data' => $demo->fresh()->toFrontend()]);
    }

    // -- DELETE /api/admin/demo/{demo}
    public function destroy(DemoAccount $demo): JsonResponse
    {
        $demoId = $demo->id;

        // Clean up all tenant data
        \App\Models\Contract::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\Booking::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\Invoice::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\Expense::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\Fine::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\MaintenanceLog::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\Review::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\Blog::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\Contact::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        \App\Models\Car::withoutGlobalScopes()->where('demo_account_id', $demoId)->delete();
        User::where('demo_account_id', $demoId)->delete();

        $demo->delete();
        return response()->json(['message' => 'Compte demo supprime.']);
    }

    private function sendEmail(DemoAccount $demo): bool
    {
        $fromAddress = config('mail.demo_from.address');
        $fromName    = config('mail.demo_from.name');
        $loginUrl    = rtrim(config('app.url'), '/') . '/login';

        try {
            Mail::to($demo->email, $demo->client_name)
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