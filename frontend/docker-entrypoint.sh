#!/bin/sh
set -e

# If BACKEND_URL is set (Render deployment), use template with envsubst
if [ -n "$BACKEND_URL" ]; then
    # Parse BACKEND_URL (e.g., "fxportal-backend:10000" or full URL)
    # Render provides hostport like "fxportal-backend-xxxx.onrender.com:443"
    export BACKEND_URL_HOST=$(echo "$BACKEND_URL" | sed 's|https\?://||' | sed 's|:.*||')
    export BACKEND_URL_SCHEME="https"
    
    envsubst '${BACKEND_URL_SCHEME} ${BACKEND_URL_HOST}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
else
    # Local Docker Compose: use the static nginx.conf (already copied)
    echo "No BACKEND_URL set, using default nginx.conf (Docker Compose mode)"
fi

exec nginx -g 'daemon off;'
