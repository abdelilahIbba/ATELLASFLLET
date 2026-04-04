#!/bin/sh
# Wrapper entrypoint to install openssl and generate SSL cert

# Install openssl if not present
if ! command -v openssl &> /dev/null; then
  apk add --no-cache openssl
fi

# generate-ssl.sh logic
SSL_DIR=/etc/nginx/ssl
mkdir -p "$SSL_DIR"

if [ ! -f "$SSL_DIR/selfsigned.crt" ] || [ ! -f "$SSL_DIR/selfsigned.key" ]; then
  echo "[nginx] Generating self-signed TLS certificate..."
  openssl req -x509 -nodes \
    -days 3650 \
    -newkey rsa:2048 \
    -keyout "$SSL_DIR/selfsigned.key" \
    -out    "$SSL_DIR/selfsigned.crt" \
    -subj   "/C=MA/ST=Casablanca/L=Casablanca/O=AtellasFleet/CN=atellasfleet.local" \
    -extensions v3_req \
    -addext "subjectAltName=IP:127.0.0.1,DNS:localhost,DNS:atellasfleet.local"
  echo "[nginx] Certificate generated at $SSL_DIR"
else
  echo "[nginx] TLS certificate already exists, skipping generation."
fi

# Hand off to official nginx entrypoint
exec /docker-entrypoint.sh nginx -g "daemon off;"
