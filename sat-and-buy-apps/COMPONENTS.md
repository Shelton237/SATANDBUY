# Architecture et communications SAT & BUY

## Bases de donn?es
- Le projet s'appuie uniquement sur MongoDB 6.0 d?ploy? en conteneur Docker (`docker-compose.yml`). Une seule base logique `satandbuy_db` est expos?e et persiste via le volume `mongo-data` pour conserver les donn?es m?tiers entre les red?marrages.
- Le backend se connecte ? cette instance avec `MONGO_URI` d?fini dans `env/backend.prod.env` et utilis? sans modifications dans `SAT-AND-BUY-BACKEND/config/db.js` via Mongoose (utilisation de `useNewUrlParser`, `useUnifiedTopology`, etc.). Il s'agit donc d'une base NoSQL; aucune autre base SQL/relatiionnelle n'est d?finie.

## Backend principal
- Le serveur Express central (`SAT-AND-BUY-BACKEND/api/index.js`) charge les middlewares de s?curit? (`helmet`, `cors`), le parser JSON (limit? ? 4 Mo) et expose les routes m?tiers (`/api/products`, `/api/customer`, `/api/order`, `/api/admin`, `/api/setting`, `/api/notification`, etc.) via les dossiers `routes`, `controller` et `models`. Des middlewares `isAuth` et `isAdmin` font appel ? `SAT-AND-BUY-BACKEND/config/auth.js` pour g?rer les JWT (`JWT_SECRET`) et v?rifier les droits d'acc?s.
- Les donn?es m?tiers sont repr?sent?es dans `models` (produit, commande, client, coupon, notification, param?trages, m?thodes de livraison). Des scripts nomm?s (`script/seed.js`, `script/product.js`, `script/seedVendorCatalog.js`) permettent de pr?-remplir la base.
- `server.js` lance le service apr?s l'enregistrement c?t? `eureka-js-client`, ce qui facilite la d?couverte (instance `app: 'backend'` sur `eureka-server:8761`). Le fichier expose aussi la configuration du port 5000 et l'enregistre sur le registre pour la supervision du r?seau de microservices.

## Frontends
### Console (interface d'administration)
- Application Vite + React (`SAT-AND-BUY-CONSOLE/src`) avec Tailwind, Redux, hooks personnalis?s et une couche services (`src/services`) qui synth?tise les ?changes REST et `socket.io` vers le backend.
- `server.js` enregistre le service `console` aupr?s d?Eureka et d?marre l?app sur le port 5000 (utilis? en build pour servir l'application produite). La configuration `env/console.prod.env` expose les variables API (`VITE_APP_API_BASE_URL`, `VITE_APP_API_SOCKET_URL`, `VITE_APP_STORE_DOMAIN`) ainsi que les cl?s Cloudinary n?cessaires aux uploads.

### Store (boutique client)
- Frontend Next.js 14 (`SAT-AND-BUY-STORE`) enrichi d'un PWA, NextAuth, Stripe/PayPal, i18n et sockets. Les dossiers `context`, `hooks`, `redux` et `services` orchestrent la navigation, les paniers et la personnalisation du catalogue sans toucher directement au backend.
- Toutes les requ?tes utilisateur passent par `SAT-AND-BUY-STORE/src/services` (`CustomerServices`, `OrderServices`, `SettingServices`, etc.) qui consomment les API du backend via `axios` et `NEXT_PUBLIC_API_BASE_URL`.
- Comme pour la console, `server.js` enregistre `store` dans Eureka et lance le serveur qui sert les pages Next.

## Autres composants techniques
- La pile Docker Compose (racine `docker-compose.yml`) orchestre Mongo, backend, console et store sur le r?seau `satandbuy`. Chaque service expose ses ports locaux (`mongodb` ferm?, backend 5000, console 4000, store 3000) et ajoute des `extra_hosts` pour les domaines publics.
- Traefik (`traefik/traefik.yml` + `traefik/dynamic.yml`) expose les entrypoints HTTP/HTTPS et force la redirection HTTPS via le middleware `https-redirect`. LetEncrypt s'occupe du certificat via un challenge HTTP et stocke les cl?s dans `traefik/acme.json`.
- Le script `deploy.sh` nettoie le d?p?t, r?initialise le dossier Traefik et relance `docker compose up -d --build` en injectant les variables `STORE_BUILD_*` n?cessaires au build Next.
- Le dossier `env/` contient les `.env` de production pour backend, console et store (cl?s JWT, NextAuth, Cloudinary, Stripe, etc.).

## Communication et d?ploiement
- Les frontends consomment exclusivement des API REST s?curis?es (`https://back-satbuy.dreamdigital.cm/api/*`). Les tokens JWT sont transmis via `Authorization: Bearer <token>` et v?rifi?s par `SAT-AND-BUY-BACKEND/config/auth.js`.
- Toutes les communications transitent sur le r?seau Docker `satandbuy`, ce qui permet de r?soudre les noms d?h?te comme `backend`, `store`, `console` ou `mongo` sans besoin d?exposer directement les internals.
- Traefik g?re la terminaison TLS : toutes les sollicitations HTTP sont redirig?es vers HTTPS (middleware `https-redirect`) et les certificats sont g?r?s automatiquement par LetEncrypt.
- Le backend utilise Mongoose pour parler ? Mongo (`mongodb://mongo:27017/satandbuy_db`). Il expose ses routes en HTTP/HTTPS selon l?environnement, m?me si les services, en production, sont front?s par Traefik.
- Les services front (console et store) pr?voient l?usage de WebSocket via `socket.io-client`, mais la partie socket c?t? serveur (`api/index.js`) est comment?e pour le moment ; l'architecture reste pr?te ? r?activer les notifications temps r?el.
- Eureka (`eureka-js-client`) assure la d?couverte des services backend/console/store via le port 8761 et facilite la surveillance des instances et la mise ? l'?chelle future.
- Le script `deploy.sh` automatise la mise ? jour : il fetch, reset, clean, reconstruit Traefik et relance tous les containers via Docker Compose.
