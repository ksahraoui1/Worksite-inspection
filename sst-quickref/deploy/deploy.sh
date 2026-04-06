#!/bin/bash
# Deployment script for SST-QuickRef on Hostinger VPS
# Usage: ./deploy.sh <VPS_IP> [SSH_USER]
#
# Prerequisites on VPS:
#   - Ubuntu 22.04+ or Debian 12+
#   - Root or sudo access
#   - Port 80 and 443 open

set -e

VPS_IP="${1:?Usage: ./deploy.sh <VPS_IP> [SSH_USER]}"
SSH_USER="${2:-root}"
DOMAIN="quickref.securionis.com"
DEPLOY_DIR="/var/www/${DOMAIN}"

echo "=== SST-QuickRef Deployment ==="
echo "VPS: ${SSH_USER}@${VPS_IP}"
echo "Domain: ${DOMAIN}"
echo ""

# 1. Build locally
echo "--- Step 1: Building frontend ---"
cd "$(dirname "$0")/../frontend"
npx vite build
cd ..

# 2. Upload dist/ to VPS
echo "--- Step 2: Uploading to VPS ---"
ssh "${SSH_USER}@${VPS_IP}" "mkdir -p ${DEPLOY_DIR}"
scp -r frontend/dist/* "${SSH_USER}@${VPS_IP}:${DEPLOY_DIR}/"

# 3. Upload and install Nginx config
echo "--- Step 3: Configuring Nginx ---"
scp deploy/nginx.conf "${SSH_USER}@${VPS_IP}:/tmp/quickref-nginx.conf"

ssh "${SSH_USER}@${VPS_IP}" bash -s << 'REMOTE'
  # Install Nginx if not present
  if ! command -v nginx &>/dev/null; then
    apt-get update -qq && apt-get install -y -qq nginx certbot python3-certbot-nginx
  fi

  # Install site config
  mv /tmp/quickref-nginx.conf /etc/nginx/sites-available/quickref.securionis.com
  ln -sf /etc/nginx/sites-available/quickref.securionis.com /etc/nginx/sites-enabled/

  # Test config before reloading
  nginx -t

  # Get SSL certificate (first time only)
  if [ ! -f /etc/letsencrypt/live/quickref.securionis.com/fullchain.pem ]; then
    # Temporarily use HTTP-only config for certbot
    cat > /etc/nginx/sites-available/quickref.securionis.com << 'TMPCONF'
server {
    listen 80;
    server_name quickref.securionis.com;
    root /var/www/quickref.securionis.com;
    location / { try_files $uri $uri/ /index.html; }
}
TMPCONF
    nginx -s reload
    certbot --nginx -d quickref.securionis.com --non-interactive --agree-tos -m admin@securionis.com
  fi

  # Reload Nginx with full config
  nginx -s reload
  echo "--- Nginx reloaded ---"
REMOTE

echo ""
echo "=== Deployment complete ==="
echo "Site: https://${DOMAIN}"
echo ""
echo "Next steps:"
echo "  1. Ensure DNS A record for ${DOMAIN} points to ${VPS_IP}"
echo "  2. Test: curl -I https://${DOMAIN}"
