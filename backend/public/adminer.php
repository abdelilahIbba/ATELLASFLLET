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
$cookieName = 'adminer_access';
$cookieValue = hash('sha256', (string) $token);
$hasValidCookie = isset($_COOKIE[$cookieName]) && hash_equals($cookieValue, (string) $_COOKIE[$cookieName]);
$hasValidToken = !empty($token) && isset($_GET['token']) && hash_equals($token, (string) $_GET['token']);

if ($hasValidToken) {
    setcookie($cookieName, $cookieValue, [
        'expires' => time() + 3600,
        'path' => '/adminer.php',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    $_COOKIE[$cookieName] = $cookieValue;
}

if (empty($token) || (!$hasValidToken && !$hasValidCookie)) {
    http_response_code(403);
    echo '<h3>403 Forbidden</h3>';
    exit;
}

// Load Adminer
require __DIR__ . '/adminer-core.php';
