#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="https://github.com/Shelton237/SATANDBUY.git"

echo "Déploiement local du dépôt ${REPO}"

GIT_ROOT="${SCRIPT_DIR}"
while [ "${GIT_ROOT}" != "/" ] && [ ! -d "${GIT_ROOT}/.git" ]; do
  GIT_ROOT="$(dirname "${GIT_ROOT}")"
done

if [ ! -d "${GIT_ROOT}/.git" ]; then
  echo "Impossible de localiser la racine Git ; assure-toi de cloner ${REPO}"
  exit 1
fi

echo "Mise à jour de ${GIT_ROOT} depuis origin/main"
cd "${GIT_ROOT}"
git fetch origin --prune
git reset --hard origin/main
git clean -fd

echo "Réinitialisation du dossier Traefik"
mkdir -p "${SCRIPT_DIR}/traefik"
touch "${SCRIPT_DIR}/traefik/acme.json"
chmod 600 "${SCRIPT_DIR}/traefik/acme.json"

echo "Reconstruction de la stack Docker Compose depuis ${SCRIPT_DIR}"
cd "${SCRIPT_DIR}"
STORE_BUILD_API_BASE_URL="${STORE_BUILD_API_BASE_URL:-http://backend:5000/api}"
STORE_BUILD_API_SOCKET_URL="${STORE_BUILD_API_SOCKET_URL:-http://backend:5000}"
STORE_BUILD_STORE_DOMAIN="${STORE_BUILD_STORE_DOMAIN:-https://satandbuy.dreamdigital.cm}"
STORE_BUILD_NEXTAUTH_URL="${STORE_BUILD_NEXTAUTH_URL:-https://satandbuy.dreamdigital.cm}"
export STORE_BUILD_API_BASE_URL STORE_BUILD_API_SOCKET_URL STORE_BUILD_STORE_DOMAIN STORE_BUILD_NEXTAUTH_URL
docker compose down --remove-orphans
docker compose up -d --build

echo "Déploiement terminé : surveiller les logs Traefik et vérifier les domaines."
