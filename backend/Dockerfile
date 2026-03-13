# Multi-stage Dockerfile for Laravel with PHP 8.2, Nginx, and Node.js
# Stage 1: Build frontend assets
FROM node:20-alpine AS node-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production=false

# Copy application files needed for build
COPY . .

# Build Tailwind CSS and Vite assets
RUN npm run build

# Stage 2: Composer dependencies
FROM composer:2.7 AS composer-builder

WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies (production only, optimized)
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# Stage 3: Final production image
FROM php:8.2-fpm-alpine

# Install system dependencies and PHP extensions required by Laravel
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    postgresql-client \
    postgresql-dev \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    && export PATH=$PATH:/usr/bin \
    && ln -s /usr/bin/pg_config /usr/local/bin/pg_config \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    zip \
    exif \
    pcntl \
    bcmath \
    gd \
    intl

# Install Redis extension for caching (optional but recommended)
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Set working directory
WORKDIR /var/www/html

# Copy composer dependencies from builder
COPY --from=composer-builder /app/vendor ./vendor

# Copy built assets from node builder
COPY --from=node-builder /app/public/build ./public/build

# Copy application files
COPY . .

# Copy PHP-FPM configuration
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

# Copy Nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Copy supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set proper permissions
# Laravel needs write access to storage and bootstrap/cache
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Create necessary directories
RUN mkdir -p /var/www/html/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/html/storage/logs

# Copy the entire storage directory to ensure it is included in the image
COPY storage /var/www/html/storage

# Expose port 80 for Nginx
EXPOSE 80

# Health check to ensure container is healthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD curl -f http://localhost/health || exit 1

# Set entrypoint to handle initialization
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Use supervisor to run both Nginx and PHP-FPM
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
