#!/bin/sh
set -eu

# Only these variables are expanded; Nginx variables such as $host survive.
BACKEND_URL="${BACKEND_URL:-https://issue-tracker-backend-23d7.onrender.com}"
BACKEND_URL="${BACKEND_URL%/}"
case "$BACKEND_URL" in
  https://*) BACKEND_HOST="${BACKEND_URL#https://}" ;;
  http://*) BACKEND_HOST="${BACKEND_URL#http://}" ;;
  *) echo "BACKEND_URL must start with http:// or https://" >&2; exit 1 ;;
esac
case "$BACKEND_HOST" in
  ''|*[!a-zA-Z0-9.:-]*) echo "BACKEND_URL must contain only a hostname and optional port" >&2; exit 1 ;;
esac
NGINX_RESOLVER="$(awk '/^nameserver / {print $2; exit}' /etc/resolv.conf)"
: "${NGINX_RESOLVER:?No DNS resolver configured}"
export BACKEND_URL BACKEND_HOST NGINX_RESOLVER
envsubst '${BACKEND_URL} ${BACKEND_HOST} ${NGINX_RESOLVER}' \
  < /etc/nginx/nginx.conf.template > /tmp/issue-tracker-nginx.conf

# Non-root containers can write here. This also identifies the deployed frontend
# commit without serving a cached HTML page as proof of a successful deployment.
printf '{"commit":"%s"}\n' "${RENDER_GIT_COMMIT:-local}" > /tmp/deployment.json
exec nginx -c /tmp/issue-tracker-nginx.conf -g 'daemon off;'
