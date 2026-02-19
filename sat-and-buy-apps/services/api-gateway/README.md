# API Gateway

Passerelle Express qui expose `/api/*` et reverse-proxifie vers les microservices Sat & Buy :

- `/api/auth/*` → `auth-service`
- `/api/catalog/*` → `catalog-service`
- `/api/orders`, `/api/order`, `/api/shipping-rate` → `order-service`
- `/api/setting/*` → `settings-service`
- `/api/notification/*` → `notification-service`
- `/api/delivery/*` → `delivery-service`

## Démarrage

```bash
cd services/api-gateway
cp .env.example .env
npm install
npm run dev
```

Configurez les URL internes et l’observabilité via `.env`. Il n’existe plus de fallback vers le monolithe : toute route doit être servie par les microservices listés ci-dessus.
