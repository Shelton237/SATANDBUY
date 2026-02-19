FROM node:18-alpine

WORKDIR /app

COPY services/api-gateway/package*.json ./services/api-gateway/
COPY packages ./packages
RUN set -eux; \
    for dir in shared catalog-domain delivery-domain notification-domain settings-domain order-domain; do \
      if [ -d "packages/$dir" ]; then \
        (cd "packages/$dir" && npm install --omit=dev --legacy-peer-deps); \
      fi; \
    done
RUN cd services/api-gateway && npm install --omit=dev --legacy-peer-deps

COPY services/api-gateway ./services/api-gateway

WORKDIR /app/services/api-gateway

EXPOSE 5055
CMD ["npm", "start"]
