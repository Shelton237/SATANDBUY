FROM node:18-alpine

WORKDIR /app

COPY services/settings-service/package*.json ./services/settings-service/
COPY packages ./packages
RUN set -eux; \
    for dir in shared catalog-domain delivery-domain notification-domain settings-domain order-domain; do \
      if [ -d "packages/$dir" ]; then \
        (cd "packages/$dir" && npm install --omit=dev --legacy-peer-deps); \
      fi; \
    done
RUN cd services/settings-service && npm install --omit=dev --legacy-peer-deps

COPY services/settings-service ./services/settings-service

WORKDIR /app/services/settings-service

EXPOSE 5300
CMD ["npm", "start"]
