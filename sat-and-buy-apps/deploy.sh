#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="https://github.com/Shelton237/SATANDBUY.git"

echo "Déploiement local du dépôt ${REPO} dans ${ROOT_DIR}"

if [ ! -d "${ROOT_DIR}/.git" ]; then
  echo "Le dépôt n'existe pas localement, clonage en cours..."
  git clone "${REPO}" "${ROOT_DIR}"
fi

cd "${ROOT_DIR}"
echo "Mise à jour sur origin/main"
git fetch origin --prune
git reset --hard origin/main
git clean -fd

mkdir -p traefik
touch traefik/acme.json
chmod 600 traefik/acme.json

echo "Reconstruction de la stack Docker Compose"
docker compose down --remove-orphans
docker compose up -d --build

echo "Déploiement terminé : surveiller les logs Traefik et vérifier les domaines."
