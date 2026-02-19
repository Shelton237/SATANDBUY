FROM node:18-alpine

WORKDIR /app

COPY services/notification-service/package*.json ./services/notification-service/
COPY packages ./packages
RUN set -eux; \
    for dir in shared catalog-domain delivery-domain notification-domain settings-domain order-domain; do \
      if [ -d "packages/$dir" ]; then \
        (cd "packages/$dir" && npm install --omit=dev --legacy-peer-deps); \
      fi; \
    done
RUN cd services/notification-service && npm install --omit=dev --legacy-peer-deps

COPY services/notification-service ./services/notification-service

WORKDIR /app/services/notification-service

EXPOSE 5400
CMD ["npm", "start"]
