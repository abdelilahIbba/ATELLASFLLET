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

# ── Default MAIL_MAILER to smtp in production ─────────────────────────
export MAIL_MAILER=${MAIL_MAILER:-smtp}

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
echo "[*] Waiting for database connection..."
until php artisan db:show 2>/dev/null; do
    echo "Database not ready, waiting 2 seconds..."
    sleep 2
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
