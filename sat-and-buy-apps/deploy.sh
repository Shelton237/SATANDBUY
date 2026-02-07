#!/usr/bin/env bash
set -euo pipefail

# Script simple to deploy the latest main branch on the production server.
REMOTE="root@38.242.216.23"
REMOTE_DIR="/root/sat-and-buy-apps"
REPO="https://github.com/Shelton237/SATANDBUY.git"

echo "Synchronising ${REPO} on ${REMOTE}:${REMOTE_DIR}"

ssh "${REMOTE}" <<EOF
set -euo pipefail

if [ ! -d "${REMOTE_DIR}/.git" ]; then
  echo "Cloning repository into ${REMOTE_DIR}"
  git clone "${REPO}" "${REMOTE_DIR}"
fi

cd "${REMOTE_DIR}"
echo "Ensuring working tree matches origin/main"
git fetch origin --prune
git reset --hard origin/main
git clean -fd
chmod 600 traefik/acme.json

echo "Building and starting the compose stack"
docker compose down --remove-orphans
docker compose up -d --build
EOF

echo "Déploiement terminé : vérifie les logs Traefik ou les endpoints HTTPS."
