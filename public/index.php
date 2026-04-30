<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Subdirectory deployment fix (Sakura auto-rewrites /pldl-lp/foo → /pldl-lp/public/foo
// but REQUEST_URI keeps /pldl-lp/foo while SCRIPT_NAME becomes /pldl-lp/public/index.php).
// Strip /public/ from SCRIPT_NAME so Symfony's pathinfo detection finds /pldl-lp prefix.
foreach (['SCRIPT_NAME', 'PHP_SELF'] as $__k) {
    if (isset($_SERVER[$__k]) && str_contains($_SERVER[$__k], '/public/index.php')) {
        $_SERVER[$__k] = str_replace('/public/index.php', '/index.php', $_SERVER[$__k]);
    }
}
unset($__k);

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
