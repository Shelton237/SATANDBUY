# Architecture SAT & BUY (microservices)

## Données & infrastructure
- MongoDB 6.0 tourne en conteneur (`services.mongo`). Chaque domaine utilise sa base logique (`satandbuy_auth`, `satandbuy_catalog`, `satandbuy_orders`, `satandbuy_settings`, `satandbuy_notification`, `satandbuy_delivery`). Les volumes `mongo-data` et `mongo-catalog-data` assurent la persistance.
- Un bus NATS (`services.nats`) transporte les événements techniques/pub-sub (ex. `order.placed`, `order.delivery.confirmed`) via `@satandbuy/shared/events`.
- Les packages `packages/shared` et `packages/*-domain` fournissent les briques communes : connexion Mongo, auth/JWT, observabilité partagée, contrôleurs et modèles métier.

## Backend (services Node.js)
Chaque service Express se trouve dans `services/<nom>-service` et importe les modules de son package de domaine :

| Service | Port | Responsabilité |
|---------|------|----------------|
| `auth-service` | 6001 | Connexion admin/client, émission JWT, refresh tokens. |
| `catalog-service` | 5100 | Produits, catégories, attributs, langues, devises, coupons, listes de marché. |
| `order-service` | 5200 | Commandes client & console, expéditions, intégrations Stripe/Razorpay/PayPal. |
| `settings-service` | 5300 | Paramètres globaux & boutique (PWA, thèmes, clés publiques…). |
| `notification-service` | 5400 | CRUD notifications + consommation des événements `ORDER_PLACED`. |
| `delivery-service` | 5500 | Réservation/libération des créneaux chauffeurs et réaction aux événements de livraison. |
| `api-gateway` | 5055 | Reverse proxy unique `/api/*` qui distribue les requêtes vers les services ci-dessus. |

Le monolithe historique `SAT-AND-BUY-BACKEND` a été archivé dans `archive/SAT-AND-BUY-BACKEND` et n’est plus démarré.

## Frontends
### Console (administration)
- Application React + Vite (`SAT-AND-BUY-CONSOLE`) prenant ses données via `VITE_APP_*` pointant sur l’API Gateway ou directement sur les sous-domaines microservices (prod).
- Couche `src/services` et `src/services/httpClients.js` mutualise les appels REST vers `/api/*`.
- Supporte les notifications temps réel via `socket.io` lorsque les services les proposent.

### Store (boutique client)
- Next.js 14 + NextAuth + Stripe/Razorpay, bundlé dans `SAT-AND-BUY-STORE`.
- Les appels partent de `src/services` (axios) et utilisent `NEXT_PUBLIC_*` (définis au build via `STORE_BUILD_*`). Par défaut, le trafic passe par `http://api-gateway:5055/api`.
- Intègre les mêmes endpoints que la console mais côté client (catalogue, commande, settings, auth).

## Orchestration & tooling
- `docker-compose.yml` orchestre Mongo, NATS, les six services métiers, l’API Gateway, la console et la boutique. Tous partagent le réseau `satandbuy`.
- Traefik (`traefik/`) fournit la terminaison TLS + redirection HTTPS (middleware `https-redirect`). Les certificats Let’s Encrypt sont stockés dans `traefik/acme.json`.
- `deploy.sh` met à jour le dépôt, initialise Traefik et reconstruit toute la stack Docker Compose. Les variables `STORE_BUILD_*` sont désormais alignées sur l’API Gateway (`http://api-gateway:5055`).
- Les nouveaux helpers d’observabilité (`@satandbuy/shared/logger|telemetry|metrics`) unifient le logging (Pino), les traces OpenTelemetry et l’expo Prometheus (`/metrics`) sur chaque service.

## Communication
- Les frontends parlent uniquement au gateway (`/api/auth`, `/api/catalog`, `/api/orders`, etc.) qui reverse-proxifie vers les services.
- Le bus NATS relie order/notification/delivery (publication et consommation des événements) et servira pour catalog/settings/auth dès qu’ils publieront leurs propres évènements.
- Les variables d’environnement des services définissent `SERVICE_NAME`, `LOG_LEVEL`, `OTEL_*` et `CORS_ORIGIN`. Plus aucune variable ne pointe vers `backend:5000`.

Cette structure permet de déployer/mettre à jour chaque domaine indépendamment, tout en conservant une surface API unique côté clients (console & store).
