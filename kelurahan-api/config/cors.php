<?php

return [

    'paths' => ['api/*', 'storage/*', 'sanctum/csrf-cookie', 'file/download'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition', 'Authorization'],

    'max_age' => 0,

    'supports_credentials' => true,

];
