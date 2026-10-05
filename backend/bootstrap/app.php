<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // statefulApi() is for cookie/session-based SPAs — NOT for token-based auth.
        // Leaving it enabled causes 419 CSRF errors on all API POST requests when
        // the client sends an Authorization: Bearer token from localStorage.
        $middleware->alias([
            'role'     => \App\Http\Middleware\RoleMiddleware::class,
            'api.role' => \App\Http\Middleware\ApiRoleMiddleware::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'website' => \App\Http\Middleware\WebsitePermission::class,
        ]);
        // Authorize before route-model binding so forbidden users get 403, not 404.
        $middleware->prependToPriorityList(
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \App\Http\Middleware\CheckPermission::class,
        );
        $middleware->prependToPriorityList(
            \App\Http\Middleware\CheckPermission::class,
            \App\Http\Middleware\ApiRoleMiddleware::class,
        );
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
