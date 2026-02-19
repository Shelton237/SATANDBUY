# READMED - Installation environnement de developpement

Ce depot contient l'ensemble de la plateforme Sat & Buy: six microservices Express (auth, catalog, order, settings, notification, delivery), une API Gateway, la console d'administration (React + Vite) et la boutique client (Next.js). Ce guide explique comment preparer un environnement de travail complet sur une machine de developpement.

## Prerequis
- Git 2.40+ et un shell capable d'executer les scripts Bash ou PowerShell.
- Node.js 18 LTS (aligne sur `FROM node:18` des Dockerfiles) et npm 9+. NVM ou Volta est recommande pour basculer rapidement de version.
- Docker Desktop 4.x (Compose v2 actif) avec au minimum 8 Go de RAM alloues.
- Acces a un compte Cloudinary et aux secrets (JWT, SMTP, passerelles de paiement) si vous devez tester des parcours reels.

## Cloner et comprendre la structure
```bash
git clone https://github.com/Shelton237/SATANDBUY.git
cd sat-and-buy-apps
```

Elements principaux:
- `services/*-service` : microservices Node.js (Express) relies entre eux via MongoDB et le bus NATS.
- `packages/shared` + `packages/*-domain` : utilitaires et modules metier partages (Mongo helpers, events, logger, schemas).
- `SAT-AND-BUY-CONSOLE` et `SAT-AND-BUY-STORE` : frontends (Vite et Next.js).
- `env/*.dev.env` : gabarits des variables d'environnement pour chaque composant.
- `docker-compose.yml` (+ `docker-compose.dev.yml`) : orchestration de Mongo, NATS, services, gateway et frontends.

## Variables d'environnement
1. **Mode Docker complet**  
   Les fichiers `env/*.dev.env` sont consommes directement par Compose. Mettez a jour les valeurs suivant vos besoins (JWT, emails, clefs Cloudinary, etc.) avant de lancer les conteneurs.
2. **Mode Node local (sans Docker)**  
   Copiez le fichier `env/<service>.dev.env` dans le dossier du service sous le nom `.env` afin que `dotenv` puisse le charger:
   ```powershell
   Copy-Item env\\auth-service.dev.env services\\auth-service\\.env
   Copy-Item env\\order-service.dev.env services\\order-service\\.env
   # meme principe pour catalog, notification, delivery, settings, api-gateway
   ```
   Pour la console et la boutique:
   ```powershell
   Copy-Item env\\console.dev.env SAT-AND-BUY-CONSOLE\\.env
   Copy-Item env\\store.dev.env SAT-AND-BUY-STORE\\.env.local
   ```

## Installer les dependances Node locales
1. Installer les packages partages (necessaire si vous lancez un service hors Docker):
   ```bash
   cd packages/shared && npm install
   # repeter pour packages/catalog-domain, order-domain, delivery-domain, notification-domain, settings-domain si besoin
   ```
2. Installer les dependances d'un service ou frontend specifique:
   ```bash
   cd services/auth-service && npm install
   cd services/catalog-service && npm install
   cd SAT-AND-BUY-CONSOLE && npm install
   cd SAT-AND-BUY-STORE && npm install
   ```
   Chaque service reference `@satandbuy/shared` via `file:../../packages/shared`, il faut donc conserver l'arborescence telle quelle.

## Lancer toute la stack via Docker
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
- MongoDB (ports internes 27017), NATS (4222), microservices (5100-6001), API Gateway (5055), console (4000) et store (3000) tournent sur le reseau `satandbuy`.
- Les images buildent automatiquement chaque microservice en important les packages partages.
- Arreter: `docker compose down` (ajoutez `-v` si vous voulez supprimer les volumes Mongo).
- Logs temps reel: `docker compose logs -f api-gateway` (remplacer par le service voulu).

## Developper service par service
- **Microservices (Express)**  
  ```bash
  cd services/order-service
  npm run dev
  ```
  Chaque service expose `/health`, `/metrics` et ses routes REST. Le bus NATS est accesible via `NATS_URL` (defaut `nats://localhost:4222` hors Compose).
- **API Gateway**  
  Propage les requetes `/api/*` vers les microservices. Pensez a aligner `AUTH_SERVICE_URL`, `CATALOG_SERVICE_URL`, etc. dans `env/api-gateway.dev.env`.
- **Console (Vite)**  
  ```bash
  cd SAT-AND-BUY-CONSOLE
  npm run dev -- --host 0.0.0.0 --port 4000
  ```
  Les endpoints REST sont configures dans `.env`.
- **Store (Next.js)**  
  ```bash
  cd SAT-AND-BUY-STORE
  npm run dev
  ```
  Utilise NextAuth, Stripe/Razorpay et les services via l'API Gateway.

## Packages partages
- `packages/shared` offre logger Pino, telemetry OpenTelemetry, clients Mongo, helpers NATS (`shared/events/bus.js`), etc.  
  - `npm run lint` : verifie le style.  
  - `npm test` : placeholder (a completer).
- Les packages de domaines (catalog, order, etc.) contiennent schemas Mongoose, validators et services specifiques. Importez-les depuis les microservices correspondants.

## Tests et lint
- Microservices: `npm run lint` ou `npm test` a l'interieur de chaque service (scripts a adapter selon vos besoins).
- Frontends: `npm run test` (console) ou `npm run lint` (store) suivant les scripts declares.
- Docker: `docker compose exec <service> npm test` pour executer dans un conteneur en cours d'execution.

## Depannage rapide
- **Conteneur redemarre en boucle** : `docker compose logs <service>` pour verifier la connexion Mongo ou NATS (`ECONNREFUSED` signifie souvent que le service dependant n'est pas encore pret).
- **Ports deja utilises** : modifiez les `ports` exposes dans `docker-compose.yml` ou arretez les processus locaux qui occupent 3000/4000/5055/5100/5200/5300/5400/5500/6001.
- **Donnees Mongo disparues** : les volumes `mongo-data` et `mongo-catalog-data` persistent par defaut. Si vous les supprimez, relancez vos scripts de seed ou restaurez une sauvegarde avant de repartir.
- **NATS indisponible** : assurez-vous que le service `nats` tourne (`docker compose ps nats`). Les services se reconnectent automatiquement, sinon relancez-les.

## Ressources utiles
- `COMPONENTS.md` : description detaillee de l'architecture.
- `MICROSERVICE_ROADMAP.md` : priorites produit/tech.
- `traefik/` : configuration de l'entree HTTPS pour les deploiements.

Vous pouvez maintenant contribuer en toute autonomie: modifiez un service, relancez uniquement son conteneur (`docker compose up -d --build services/order-service`) ou utilisez `npm run dev` pour du debug pas a pas.

