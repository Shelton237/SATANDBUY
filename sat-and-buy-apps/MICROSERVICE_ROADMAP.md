# Plan de transition vers microservices

Ce document découpe la transformation du monolithe SAT & BUY en services indépendants, avec les tâches concrètes à mener dans ce dépôt (`C:\Users\TOUTENUN\Desktop\dev\DreamsDigital\sat-and-buy\sat-and-buy-apps`).

## Phase 0 – Préparation commune
- [x] Créer les dossiers `packages/shared` (constants, helpers JWT, connexion Mongo) et `services/` pour structurer les futurs microservices.
- [x] Introduire les utilitaires communs (rôles, créneaux de livraison, helpers JWT/Mongo) via `@satandbuy/shared` afin d’éviter les duplications dès le premier service extrait.
- [x] Ajouter un bus de messages (implémenté pour l'instant via `@satandbuy/shared/events/bus`, à remplacer par Kafka/RabbitMQ ensuite).
- [x] Préparer un reverse-proxy/API-Gateway (fastify/express ou Kong) exposant une unique surface `/api/*`. Initialement, il fera suivre les requêtes au backend monolithique puis basculera service par service.
- [x] Mettre en place l’observabilité commune (logger structuré, traces OpenTelemetry, métriques Prometheus) dans le package partagé (`@satandbuy/shared/logger|telemetry|metrics` + endpoints `/metrics` sur les services).

## Phase 1 – Auth & Identity Service
**Objectif** : isoler les endpoints liés à l’authentification (`/api/admin/login`, `/api/customer/login`, génération JWT) et les modèles `Admin`, `Customer` des autres responsabilités.

Tâches :
1. Créer `services/auth-service` (Node 18 + Express + Mongoose) et y déplacer :
   - `SAT-AND-BUY-BACKEND/models/Admin.js`, `models/Customer.js`.
   - Les helpers JWT de `SAT-AND-BUY-BACKEND/config/auth.js`.
2. Ajouter des routes dans le nouveau service :
   - `POST /auth/admin/login`, `POST /auth/customer/login`.
   - `POST /auth/token/refresh`, `POST /auth/logout`.
3. Alimenter une nouvelle collection `RefreshTokens` pour gérer l’expiration côté serveur.
4. Mettre à jour la console (`SAT-AND-BUY-CONSOLE/src/services/AuthService.js`) et la boutique (`SAT-AND-BUY-STORE/src/services/CustomerServices.js`) pour pointer vers les nouveaux endpoints. ✅
5. Dans le monolithe, remplacer les importations de `config/auth.js` par des appels au SDK partagé (exposé dans `packages/shared/auth`) et supprimer les routes d’auth héritées. ✅
6. Ajouter au `docker-compose.yml` un service `auth-service` branché sur la même base Mongo dans un premier temps (future étape : base dédiée + migration de données).

## Phase 2 – Catalog Service
**Objectif** : extraire tout ce qui touche au catalogue produits.

Tâches :
1. Créer `services/catalog-service` (Express + Mongoose) et y déplacer : ✅ (les routes/backoffice pointent désormais vers `services/catalog-service`)
   - Modèles `Product.js`, `Category.js`, `Attribute.js`, `Coupon.js`, `Language.js`, `Currency.js`.
   - Contrôleurs/Routes associés (`productRoutes.js`, `categoryRoutes.js`, etc.).
2. Adapter les seeds (`SAT-AND-BUY-BACKEND/script/product.js`, `script/seedVendorCatalog.js`) pour qu’ils importent les schémas depuis ce nouveau service.
3. Publier des événements lorsque le catalogue change (`ProductCreated`, `CategoryUpdated`) via le bus configuré en phase 0.
4. Mettre à jour la console (`src/services/ProductServices.js`, `CategoryServices.js`, etc.) et la boutique (`src/services/ProductServices.js`, `SettingServices.js`) pour appeler le nouveau domaine (`/catalog/*`). ✅
5. Dans le backend monolithique, supprimer les routes déplacées et ne garder que des proxys temporaires (HTTP 301) tant que tout n’est pas migré. ✅

## Phase 3 – Order Service
**Objectif** : isoler la prise de commandes et paiements.

Tâches :
1. Créer `services/order-service` et y déplacer : ✅ (nouveau service branché sur les routes historiques)
   - Modèles `Order.js`, `ShippingRate.js` (en attendant la phase 5).
   - Contrôleurs `orderController.js`, `customerOrderController.js`, `shippingRateController.js`.
   - Intégrations Stripe/PayPal/Razorpay (`lib/stripe`, `lib/paypal`, `lib/stock-controller`).
2. Base Mongo dédiée `satandbuy_orders` + collections `orders`, `payments`, `shipments`.
3. Exposer les endpoints :
   - `POST /orders` (clients), `GET /orders/:id`, `PATCH /orders/:id/status`.
   - `POST /payments/stripe`, `POST /payments/paypal`.
4. Produire des événements (`OrderPlaced`, `PaymentCaptured`) et consommer ceux du catalogue (pour vérifier le stock) via le bus. ✅ (publication `ORDER_PLACED`, `ORDER_DELIVERY_CONFIRMED` via `@satandbuy/shared/events`)
5. Adapter les frontaux (hooks `useCheckoutSubmit`, services `OrderServices`) pour pointer vers ce service. ✅
6. Dans le monolithe, retirer les routes correspondantes et consommer le bus pour rester compatible pendant la migration (anti-corruption layer). ✅ (les routes ont été désactivées côté monolithe)

## Phase 4 – Settings & Notification Services
**Settings Service** :
- [x] Déplacer `Setting.js` et `settingController.js` dans `@satandbuy/settings-domain` et exposer les routes depuis `settings-service`.
- [ ] Centraliser les préférences (PWA, Tawk, Stripe public key) et servir un endpoint `GET /settings/store` [ajouter cache Redis].

**Notification Service** :
- [x] Sortir `notificationRoutes.js` et `notificationController.js` vers `@satandbuy/notification-domain` + `notification-service`.
- [x] Consommer les événements Order (ORDER_PLACED) pour créer une notification.
- [ ] Étendre aux e-mails / push / canaux externes.

Mettre à jour la console/boutique pour appeler respectivement `settings-service` et `notification-service` (via l’API Gateway).

## Phase 5 – Delivery/Fulfillment Service
- [x] Exposer `DriverBooking` et les helpers via `@satandbuy/delivery-domain` + `delivery-service`.
- [x] Publier des endpoints `/api/delivery/*` pour réserver/libérer des créneaux et lister les slots.
- [ ] Ajouter les modèles `Driver`, `DeliveryWindow`, `Assignment` puis basculer `order-service` vers ces APIs pour planifier les livraisons.
- [ ] Synchroniser avec `order-service` via un événement `OrderReadyForDelivery`.

## Phase 6 – Gateway & Retrait du monolithe
- [x] Ajouter un service `api-gateway` dans `docker-compose.yml` qui expose `/api` et reroute vers `auth-service`, `catalog-service`, `order-service`, etc.
- [x] Migrer progressivement les endpoints restants du monolithe vers les services dédiés (tous les fronts pointent désormais vers les microservices).
- [x] Archiver `SAT-AND-BUY-BACKEND` (déplacé dans `archive/SAT-AND-BUY-BACKEND`) et supprimer le fallback depuis l’API Gateway / Docker Compose.

## Gouvernance & Qualité
- Chaque service doit avoir ses tests unitaires/intégration, linting, pipeline CI/CD.
- Définir des contrats d’API (OpenAPI/AsyncAPI) pour chaque domaine et les stocker dans `docs/contracts`.
- Mettre en place la surveillance (dashboards Grafana) et les alertes (erreurs 5xx, temps réponse, files event saturées).

---
Ce plan peut être suivi étape par étape. Chaque phase doit être livrée avec des scripts de migration et des déploiements incrémentaux pour éviter une coupure complète.
