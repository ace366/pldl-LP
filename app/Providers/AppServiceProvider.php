<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Sub-path deploy support (e.g. https://example.com/pldl-lp).
        // Only force the root URL when APP_URL has a path component, otherwise
        // local dev (APP_URL=http://127.0.0.1:8000 accessed via localhost) gets
        // its asset URLs rewritten to a different origin and breaks with CORS.
        $appUrl = config('app.url');
        if ($appUrl) {
            $parsed = parse_url($appUrl);
            $path = $parsed['path'] ?? '';
            if ($path !== '' && $path !== '/') {
                URL::forceRootUrl($appUrl);
            }
            if (($parsed['scheme'] ?? '') === 'https') {
                URL::forceScheme('https');
            }
        }
    }
}
