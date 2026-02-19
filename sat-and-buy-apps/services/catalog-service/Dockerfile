# syntax=docker/dockerfile:1

FROM node:18

WORKDIR /app

COPY services/catalog-service/package*.json ./services/catalog-service/
COPY packages ./packages
RUN set -eux; \
    for dir in shared catalog-domain delivery-domain notification-domain settings-domain order-domain; do \
      if [ -d "packages/$dir" ]; then \
        (cd "packages/$dir" && npm install --omit=dev --legacy-peer-deps); \
      fi; \
    done
RUN cd services/catalog-service && npm install --omit=dev --legacy-peer-deps

COPY services/catalog-service ./services/catalog-service

WORKDIR /app/services/catalog-service

EXPOSE 5100

CMD ["npm", "start"]
