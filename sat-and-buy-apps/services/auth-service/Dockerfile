# syntax=docker/dockerfile:1

FROM node:18

WORKDIR /app

COPY services/auth-service/package*.json ./services/auth-service/
COPY packages ./packages
RUN set -eux; \
    for dir in shared catalog-domain delivery-domain notification-domain settings-domain order-domain; do \
      if [ -d "packages/$dir" ]; then \
        (cd "packages/$dir" && npm install --omit=dev --legacy-peer-deps); \
      fi; \
    done
RUN cd services/auth-service && npm install --omit=dev --legacy-peer-deps

COPY services/auth-service ./services/auth-service

WORKDIR /app/services/auth-service

EXPOSE 6001

CMD ["npm", "start"]
