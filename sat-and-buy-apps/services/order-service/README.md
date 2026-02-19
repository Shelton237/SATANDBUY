# Order Service

Service dédié aux commandes (côté client + console), aux paiements Stripe/Razorpay et aux livraisons.

## Démarrage

```bash
cd services/order-service
cp .env.example .env
npm install
npm run dev
```

## Routes prises en charge

- `/api/order/*` (création commande, board client, confirmation livraison…)
- `/api/orders/*` (tableau de bord, Kanban, mise à jour statuts…)
- `/api/shipping-rate/*`

Les modèles et contrôleurs proviennent du package `@satandbuy/order-domain`, ce qui remplace définitivement les dépendances au monolithe désormais archivé.
