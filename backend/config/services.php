<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | OCR Service
    |--------------------------------------------------------------------------
    | driver: 'google_vision' (default) uses Google Cloud Vision REST API.
    | Set GOOGLE_CLOUD_VISION_KEY in .env to enable it.
    |
    */
    'ocr' => [
        'driver'            => env('OCR_DRIVER', 'google_vision'),
        'google_vision_key' => env('GOOGLE_CLOUD_VISION_KEY'),
    ],

    'allogps' => [
        'base_url'          => env('GPS_API_BASE_URL', 'https://s16.allogps.com:5557'),
        'agency_id'         => env('GPS_API_AGENCY_ID'),
        'email'             => env('GPS_API_EMAIL'),
        'password'          => env('GPS_API_PASSWORD'),
        'stale_after_seconds' => (int) env('GPS_STALE_AFTER_SECONDS', 300),
    ],

];
