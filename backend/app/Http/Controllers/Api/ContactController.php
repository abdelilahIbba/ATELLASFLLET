<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactResource;
use App\Mail\AdminReplyMail;
use App\Models\Contact;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    // ────────────────────────────────────────────────────────────────────────
    // Public
    // ────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/contact  (public — from home-page / booking contact form)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255',
            'subject'    => 'required|string|max:255',
            'message'    => 'required|string',
            'type'       => 'nullable|string|in:Support,Inquiry,Emergency',
            'booking_id' => 'nullable|integer',
        ]);

        // Auto-derive type from subject when not provided by the client
        if (empty($validated['type'])) {
            $subject = strtolower($validated['subject']);
            if (str_contains($subject, 'urgence') || str_contains($subject, 'emergency')) {
                $validated['type'] = 'Emergency';
            } elseif (str_contains($subject, 'support') || str_contains($subject, 'assistance')) {
                $validated['type'] = 'Support';
            } else {
                $validated['type'] = 'Inquiry';
            }
        }

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Votre message a bien été envoyé.',
            'contact' => new ContactResource($contact),
        ], 201);
    }

    /**
     * POST /api/my-message  (authenticated client — name/email taken from session)
     */
    public function storeAuthenticated(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'subject'    => 'required|string|max:255',
            'message'    => 'required|string',
            'type'       => 'nullable|string|in:Support,Inquiry,Emergency',
            'booking_id' => 'nullable|integer',
        ]);

        if (empty($validated['type'])) {
            $subject = strtolower($validated['subject']);
            if (str_contains($subject, 'urgence') || str_contains($subject, 'emergency')) {
                $validated['type'] = 'Emergency';
            } elseif (str_contains($subject, 'support') || str_contains($subject, 'assistance')) {
                $validated['type'] = 'Support';
            } else {
                $validated['type'] = 'Inquiry';
            }
        }

        $contact = Contact::create(array_merge($validated, [
            'name'  => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? $user->name ?? 'Client')),
            'email' => $user->email,
        ]));

        return response()->json([
            'message' => 'Votre message a bien été envoyé.',
            'contact' => new ContactResource($contact),
        ], 201);
    }

    /**
     * GET /api/my-thread  (authenticated client — fetch all messages by own email)
     */
    public function myThread(Request $request): JsonResponse
    {
        $email    = $request->user()->email;
        $contacts = Contact::where('email', $email)
            ->latest()
            ->get();

        return response()->json([
            'data' => ContactResource::collection($contacts),
        ]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Admin
    // ────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/contacts  (admin)
     * Supports: ?is_read=0|1, ?type=Support|Inquiry|Emergency, ?per_page=N
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Contact::query();

        if ($request->filled('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('search')) {
            $search = '%' . $request->string('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('email', 'like', $search)
                  ->orWhere('subject', 'like', $search)
                  ->orWhere('message', 'like', $search);
            });
        }

        return ContactResource::collection(
            $query->latest()->paginate($request->get('per_page', 100))
        );
    }

    /**
     * GET /api/admin/contacts/{contact}  (admin — auto-marks as read)
     */
    public function show(Contact $contact): JsonResponse
    {
        if (!$contact->is_read) {
            $contact->update(['is_read' => true]);
        }

        return response()->json(['contact' => new ContactResource($contact->fresh())]);
    }

    /**
     * POST /api/admin/contacts/{contact}/reply  (admin)
     * Stores the reply text, records timestamp, and —if enabled— emails the client.
     */
    public function reply(Request $request, Contact $contact): JsonResponse
    {
        $validated = $request->validate([
            'reply_text' => 'required|string|max:5000',
        ]);

        $contact->update([
            'reply_text' => $validated['reply_text'],
            'replied_at' => now(),
            'is_read'    => true,
        ]);

        // ── Dispatch email to the client (async, non-blocking) ──
        $emailSent = false;
        try {
            $emailEnabled = Setting::get('notifications_reply_email_enabled', true);

            if ($emailEnabled) {
                $fromAddress = Setting::get('notifications_mail_from_address', config('mail.from.address'));
                $fromName    = Setting::get('notifications_mail_from_name',    config('mail.from.name'));

                Mail::to($contact->email, $contact->name)
                    ->send(new AdminReplyMail($contact->fresh(), $fromAddress, $fromName));
                $emailSent = true;
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Admin reply email failed', [
                'contact_id' => $contact->id,
                'error'      => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message'      => 'Réponse envoyée' . ($emailSent ? ' et email expédié.' : '.'),
            'email_sent'   => $emailSent,
            'contact'      => new ContactResource($contact->fresh()),
        ]);
    }

    /**
     * PATCH /api/admin/contacts/{contact}/read  (admin)
     * Toggles the is_read flag; returns the updated resource.
     */
    public function toggleRead(Contact $contact): JsonResponse
    {
        $contact->update(['is_read' => !$contact->is_read]);

        return response()->json(['contact' => new ContactResource($contact->fresh())]);
    }

    /**
     * DELETE /api/admin/contacts/{contact}  (admin)
     */
    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();
        return response()->json(['message' => 'Message supprimé.']);
    }
}
