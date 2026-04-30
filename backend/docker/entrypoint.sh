#!/bin/sh
# Docker entrypoint script for Laravel
# Handles initialization tasks before starting the application

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

# Wait for database to be ready
# Max 20 retries × 3 s = 60 s ceiling.  Permanent errors (quota exceeded,
# bad credentials, unknown host) abort immediately instead of looping forever.
echo "[*] Waiting for database connection..."
DB_RETRY=0
DB_MAX_RETRIES=20
until php artisan db:show 2>/tmp/db_check_err; do
    DB_ERR=$(cat /tmp/db_check_err 2>/dev/null)

    # Detect permanent / non-transient errors — retrying will never help.
    if echo "$DB_ERR" | grep -qiE \
        "quota|compute time|password authentication failed|role .+ does not exist|database .+ does not exist|no pg_hba\.conf entry|could not translate host name"; then
        echo "[FATAL] Permanent database error — aborting startup:"
        cat /tmp/db_check_err
        exit 1
    fi

    DB_RETRY=$((DB_RETRY + 1))
    if [ "$DB_RETRY" -ge "$DB_MAX_RETRIES" ]; then
        echo "[FATAL] Database not ready after $DB_MAX_RETRIES retries. Last error:"
        cat /tmp/db_check_err
        exit 1
    fi

    echo "Database not ready (attempt $DB_RETRY/$DB_MAX_RETRIES), waiting 3 seconds..."
    sleep 3
done
echo "[OK] Database connection established"

# Clear and cache configuration for production
echo "[*] Optimizing Laravel caches..."
php artisan config:cache
php artisan route:cache || echo "[WARN] route:cache failed, continuing without route cache"
php artisan view:cache || echo "[WARN] view:cache failed, continuing without view cache"

# Run database migrations
echo "[*] Running database migrations..."
php artisan migrate --force --no-interaction

# Create storage link if it doesn't exist
if [ ! -L /var/www/html/public/storage ]; then
    echo "[*] Creating storage symlink..."
    php artisan storage:link
fi

echo "[OK] Initialization complete! Starting application services..."

# Execute the main command (supervisor)
exec "$@"
