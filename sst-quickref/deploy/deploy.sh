#!/bin/bash
# Deployment script — SST-QuickRef sur Hostinger VPS avec Cloudflare (mode Flexible)
#
# Usage:
#   Première installation : ./deploy.sh setup 31.97.36.92
#   Mise à jour           : ./deploy.sh update 31.97.36.92

set -e

ACTION="${1:?Usage: ./deploy.sh <setup|update> <VPS_IP> [SSH_USER]}"
VPS_IP="${2:?Usage: ./deploy.sh <setup|update> <VPS_IP> [SSH_USER]}"
SSH_USER="${3:-root}"
DOMAIN="quickref.securionis.com"
DEPLOY_DIR="/var/www/${DOMAIN}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== SST-QuickRef Deployment ($ACTION) ==="
echo "VPS : ${SSH_USER}@${VPS_IP}"
echo "Domain : ${DOMAIN}"
echo ""

# ─── Build frontend ──────────────────────────────────────────────────────────
echo "--- Build frontend ---"
cd "${SCRIPT_DIR}/../frontend"
npm install --silent
npm run build
cd "${SCRIPT_DIR}/.."

# ─── Upload fichiers frontend ────────────────────────────────────────────────
echo "--- Upload dist/ vers VPS ---"
ssh "${SSH_USER}@${VPS_IP}" "mkdir -p ${DEPLOY_DIR}"
scp -r frontend/dist/* "${SSH_USER}@${VPS_IP}:${DEPLOY_DIR}/"

if [ "$ACTION" = "setup" ]; then
  # ─── Installation Nginx + configuration ─────────────────────────────────
  echo "--- Configuration Nginx ---"
  scp "${SCRIPT_DIR}/nginx.conf" "${SSH_USER}@${VPS_IP}:/tmp/quickref-nginx.conf"

  ssh "${SSH_USER}@${VPS_IP}" bash -s << 'REMOTE'
    set -e

    # Installer Nginx si absent
    if ! command -v nginx &>/dev/null; then
      apt-get update -qq && apt-get install -y -qq nginx
    fi

    # Désactiver le site default
    rm -f /etc/nginx/sites-enabled/default

    # Installer la config du site
    mv /tmp/quickref-nginx.conf /etc/nginx/sites-available/quickref.securionis.com
    ln -sf /etc/nginx/sites-available/quickref.securionis.com \
           /etc/nginx/sites-enabled/quickref.securionis.com

    nginx -t
    systemctl enable nginx
    systemctl restart nginx
    echo "--- Nginx installé et démarré ---"
REMOTE
fi

if [ "$ACTION" = "update" ]; then
  ssh "${SSH_USER}@${VPS_IP}" "nginx -s reload"
  echo "--- Nginx rechargé ---"
fi

echo ""
echo "=== Déploiement terminé ==="
echo "Site : https://${DOMAIN}"
echo ""
echo "Vérification :"
echo "  curl -I https://${DOMAIN}"
