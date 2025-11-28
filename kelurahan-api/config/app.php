<?php

return [

    'name' => env('APP_NAME', 'Laravel'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', false),

    'url' => env('APP_URL', 'http://localhost'),

    'asset_url' => env('ASSET_URL'),

    'timezone' => 'Asia/Jakarta', // Diubah ke WIB

    'locale' => env('APP_LOCALE', 'id'), // Default ke Indonesia jika ada

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'id_ID'), // Faker data Indonesia

    'key' => env('APP_KEY'),

    'cipher' => 'AES-256-CBC',

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store'  => env('APP_MAINTENANCE_STORE', 'database'),
    ],

    'providers' => \Illuminate\Support\ServiceProvider::defaultProviders()->merge([
        /*
         * Package Service Providers...
         */

        /*
         * Application Service Providers...
         */
        App\Providers\AppServiceProvider::class,
        // App\Providers\AuthServiceProvider::class,
        // App\Providers\BroadcastServiceProvider::class,
        // App\Providers\EventServiceProvider::class,
        // App\Providers\RouteServiceProvider::class,
    ])->toArray(),

    'aliases' => \Illuminate\Support\Facades\Facade::defaultAliases()->merge([
        // 'Example' => App\Facades\Example::class,
    ])->toArray(),

];
