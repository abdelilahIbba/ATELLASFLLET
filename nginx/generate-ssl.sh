#!/bin/sh
# generate-ssl.sh
#
# Generates a self-signed TLS certificate at container start if one does not
# already exist.  The cert is written to /etc/nginx/ssl/ and is valid for
# 3650 days (10 years) so it never expires during development.
#
# iOS requires HTTPS for getUserMedia() (camera API) to be available.
# When testing on an iPhone over a local network, open:
#   https://<your-machine-ip>/
# Safari will warn about the untrusted cert — tap "Advanced" → "Continue to
# website".  After that, camera access works normally.

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

# Hand off to the official nginx entrypoint
exec nginx -g "daemon off;"
