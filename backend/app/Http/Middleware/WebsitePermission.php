<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Usage: ->middleware('website:bookings.create') → checks "website.bookings.create".
 */
class WebsitePermission
{
    public function handle(Request $request, Closure $next, string $key): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        if (!$user->isActive()) {
            return response()->json(['message' => 'Compte désactivé.'], 403);
        }
        if ($user->role === 'demo_admin' || $user->isSuperAdmin()) {
            return $next($request);
        }

        return $user->hasPermission("website.$key")
            ? $next($request)
            : response()->json(['message' => 'Forbidden. Insufficient permissions.'], 403);
    }
}
