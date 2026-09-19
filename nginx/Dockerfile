FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

# Copy nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script and verify it exists
COPY entrypoint.sh /usr/local/bin/docker-entrypoint-wrapper.sh
RUN test -f /usr/local/bin/docker-entrypoint-wrapper.sh || (echo "ERROR: entrypoint not copied!" && exit 1)
RUN chmod +x /usr/local/bin/docker-entrypoint-wrapper.sh

# Call our entrypoint script directly
ENTRYPOINT ["/usr/local/bin/docker-entrypoint-wrapper.sh"]
