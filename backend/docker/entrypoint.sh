#!/bin/sh
# Docker entrypoint script for Laravel
# Handles initialization tasks before starting the application
#
# Design principle: the app ALWAYS starts (so /health passes and Render marks
# the instance live).  DB-dependent steps (migrate) are attempted but never
# allowed to block or kill the container.

set -e

echo "[*] Starting Laravel application initialization..."

# ── Ensure APP_KEY is set (required for cookie/session encryption) ────
if [ -z "$APP_KEY" ]; then
    echo "[WARN] APP_KEY not set — generating one now..."
    export APP_KEY=$(php artisan key:generate --show)
    echo "[OK] APP_KEY generated: ${APP_KEY:0:12}..."
fi

# ── Default SESSION_DRIVER to cookie (no DB table needed) ─────────────
export SESSION_DRIVER=${SESSION_DRIVER:-cookie}

# ── Force MAIL_MAILER to smtp unless explicitly set to something other than log ──
if [ -z "$MAIL_MAILER" ] || [ "$MAIL_MAILER" = "log" ]; then
    export MAIL_MAILER=smtp
fi

# ── Ensure storage directories exist and are writable ─────────────────
echo "[*] Preparing storage directories..."
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# ── Cache config / routes / views (no DB required) ────────────────────
echo "[*] Optimizing Laravel caches..."
php artisan config:cache
php artisan route:cache  || echo "[WARN] route:cache failed, continuing without route cache"
php artisan view:cache   || echo "[WARN] view:cache failed, continuing without view cache"

# ── Create storage symlink if needed (no DB required) ─────────────────
if [ ! -L /var/www/html/public/storage ]; then
    echo "[*] Creating storage symlink..."
    php artisan storage:link
fi

# ── Database migrations — non-blocking ────────────────────────────────
# We try once, with a short connection timeout.  If the DB is unavailable
# (cold-start wake-up, quota issue, network blip) we log the error and
# continue.  The app will still serve /health so Render marks it live.
# Re-run via Render Shell: php artisan migrate --force
echo "[*] Attempting database migrations..."
# Temporarily disable set -e so a migration failure doesn't kill the container
set +e
php artisan migrate --force --no-interaction >/tmp/migrate_out 2>&1
MIGRATE_EXIT=$?
set -e

if [ "$MIGRATE_EXIT" -eq 0 ]; then
    echo "[OK] Migrations complete."
else
    echo "[WARN] Migrations failed (exit $MIGRATE_EXIT). App will still start."
    echo "[WARN] Last migration output:"
    tail -10 /tmp/migrate_out
    echo "[WARN] Re-run manually via Render Shell: php artisan migrate --force"
fi

echo "[OK] Initialization complete — starting application services..."

# Execute the main command (supervisor)
exec "$@"

# Execute the main command (supervisor)
exec "$@"
