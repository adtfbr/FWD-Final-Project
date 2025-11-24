<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // Izinkan path api dan file download
    'paths' => ['api/*', 'storage/*', 'sanctum/csrf-cookie', 'file/download'],

    'allowed_methods' => ['*'],

    // PENTING: Masukkan kedua variasi localhost ini
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'], // Agar nama file terbaca

    'max_age' => 0,

    'supports_credentials' => true,

];
