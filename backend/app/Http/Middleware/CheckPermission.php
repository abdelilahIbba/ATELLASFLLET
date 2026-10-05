<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Usage: ->middleware('permission:cars') (action derived from HTTP verb)
 *        ->middleware('permission:cars,edit') (explicit action)
 */
class CheckPermission
{
    private const DEMO_DENIED = ['users', 'roles'];

    public function handle(Request $request, Closure $next, string $page, ?string $action = null): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        if (!$user->isActive()) {
            return response()->json(['message' => 'Compte désactivé.'], 403);
        }

        // Demo accounts keep their legacy behaviour (tenant-scoped data), except security pages.
        if ($user->role === 'demo_admin') {
            return in_array($page, self::DEMO_DENIED, true)
                ? $this->deny()
                : $next($request);
        }

        if (!$user->hasAdminAccess()) {
            return $this->deny();
        }

        $action ??= match (strtoupper($request->method())) {
            'GET', 'HEAD', 'OPTIONS' => 'view',
            'POST' => 'create',
            'PUT', 'PATCH' => 'edit',
            'DELETE' => 'delete',
            default => 'view',
        };

        return $user->hasPermission("admin.$page.$action") ? $next($request) : $this->deny();
    }

    private function deny(): Response
    {
        return response()->json(['message' => 'Forbidden. Insufficient permissions.'], 403);
    }
}
