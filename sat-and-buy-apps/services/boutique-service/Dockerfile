# syntax=docker/dockerfile:1

FROM node:18

ENV npm_config_cache=/tmp/.npm-cache

WORKDIR /app

COPY services/boutique-service/package*.json ./services/boutique-service/
COPY packages ./packages
RUN set -eux; \
    for dir in shared boutique-domain; do \
      if [ -d "packages/$dir" ]; then \
        (cd "packages/$dir" && npm install --omit=dev --legacy-peer-deps); \
      fi; \
    done
RUN cd services/boutique-service && npm install --omit=dev --legacy-peer-deps

COPY services/boutique-service ./services/boutique-service

WORKDIR /app/services/boutique-service

EXPOSE 5600

CMD ["npm", "start"]
