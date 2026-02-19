# syntax=docker/dockerfile:1

FROM node:18

ENV npm_config_cache=/tmp/.npm-cache

WORKDIR /app

COPY services/order-service/package*.json ./services/order-service/
COPY packages ./packages
RUN set -eux; \
    for dir in shared catalog-domain delivery-domain notification-domain settings-domain order-domain; do \
      if [ -d "packages/$dir" ]; then \
        (cd "packages/$dir" && npm install --omit=dev --legacy-peer-deps); \
      fi; \
    done
RUN cd services/order-service && npm install --omit=dev --legacy-peer-deps

COPY services/order-service ./services/order-service

WORKDIR /app/services/order-service

EXPOSE 5200

CMD ["npm", "start"]
