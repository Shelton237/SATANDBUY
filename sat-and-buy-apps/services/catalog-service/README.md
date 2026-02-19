# Catalog Service

Expose les routes catalogue (`/api/products`, `/api/category`, etc.) jusqu'ici gérées par le monolithe.

## Démarrage local

```bash
cd services/catalog-service
cp .env.example .env
npm install
npm run dev
```

## Routes servies

- `GET/POST /api/products/*`
- `GET/POST /api/category/*`
- `GET/POST /api/attributes/*`
- `GET/POST /api/coupon/*`
- `GET /api/customer/market-lists/*`
- `GET/PUT /api/language/*`
- `GET/PUT /api/currency/*`

Les contrôleurs et modèles sont désormais fournis par `@satandbuy/catalog-domain`, ce qui supprime toute dépendance au monolithe (archivé dans `archive/SAT-AND-BUY-BACKEND` pour mémoire).
