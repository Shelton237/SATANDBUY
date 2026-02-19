FROM node:18-alpine

WORKDIR /app

COPY services/delivery-service/package*.json ./services/delivery-service/
COPY packages ./packages
RUN set -eux; \
    for dir in shared catalog-domain delivery-domain notification-domain settings-domain order-domain; do \
      if [ -d "packages/$dir" ]; then \
        (cd "packages/$dir" && npm install --omit=dev --legacy-peer-deps); \
      fi; \
    done
RUN cd services/delivery-service && npm install --omit=dev --legacy-peer-deps

COPY services/delivery-service ./services/delivery-service

WORKDIR /app/services/delivery-service

EXPOSE 5500
CMD ["npm", "start"]
