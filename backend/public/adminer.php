<?php
/**
 * Password-protected Adminer entry point.
 *
 * Access: https://your-domain.com/adminer.php?token=YOUR_SECRET_TOKEN
 *
 * Set ADMINER_TOKEN in your Render environment variables.
 * If not set, access is denied entirely.
 */

$token = getenv('ADMINER_TOKEN');

if (empty($token) || !isset($_GET['token']) || !hash_equals($token, $_GET['token'])) {
    http_response_code(403);
    echo '<h3>403 Forbidden</h3>';
    exit;
}

// Load Adminer
require __DIR__ . '/adminer-core.php';
