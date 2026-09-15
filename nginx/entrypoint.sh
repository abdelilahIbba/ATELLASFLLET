#!/bin/sh
set -e

# Install openssl if not present
if ! command -v openssl > /dev/null 2>&1; then
  apk add --no-cache openssl
fi

# Generate SSL certificate
SSL_DIR=/etc/nginx/ssl
mkdir -p "$SSL_DIR"

if [ ! -f "$SSL_DIR/selfsigned.crt" ] || [ ! -f "$SSL_DIR/selfsigned.key" ]; then
  echo "[nginx] Generating self-signed TLS certificate..."
  openssl req -x509 -nodes \
    -days 3650 \
    -newkey rsa:2048 \
    -keyout "$SSL_DIR/selfsigned.key" \
    -out "$SSL_DIR/selfsigned.crt" \
    -subj "/C=MA/ST=Casablanca/L=Casablanca/O=AtellasFleet/CN=atellasfleet.local" \
    -extensions v3_req \
    -addext "subjectAltName=IP:127.0.0.1,DNS:localhost,DNS:atellasfleet.local"
  echo "[nginx] Certificate generated at $SSL_DIR"
else
  echo "[nginx] TLS certificate already exists, skipping generation."
fi

# Execute nginx directly
nginx -g "daemon off;"
