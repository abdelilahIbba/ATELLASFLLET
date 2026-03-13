<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiRoleMiddleware
{
    /**
     * Handle an incoming request — JSON-based role check for API routes.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Forbidden. Insufficient permissions.'], 403);
        }

        return $next($request);
    }
}
