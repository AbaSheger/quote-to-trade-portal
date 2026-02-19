#!/bin/sh
set -e

# If BACKEND_URL is set (Railway/Render deployment), use template with envsubst
if [ -n "$BACKEND_URL" ]; then
    # Parse BACKEND_URL (e.g., "https://fxportal-backend.up.railway.app")
    export BACKEND_URL_HOST=$(echo "$BACKEND_URL" | sed 's|https\?://||' | sed 's|/.*||' | sed 's|:.*||')
    export BACKEND_URL_SCHEME="https"
    
    # Railway sets PORT env var; default to 80
    export NGINX_PORT=${PORT:-80}
    
    envsubst '${BACKEND_URL_SCHEME} ${BACKEND_URL_HOST} ${NGINX_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
else
    # Local Docker Compose: use the static nginx.conf (already copied)
    echo "No BACKEND_URL set, using default nginx.conf (Docker Compose mode)"
fi

exec nginx -g 'daemon off;'
