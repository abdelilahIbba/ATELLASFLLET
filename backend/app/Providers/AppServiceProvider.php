<?php

namespace App\Providers;

use App\Services\ActivityLogger;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ActivityLogger::class, function ($app) {
            return new ActivityLogger();
        });
    }
}