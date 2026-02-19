# Services

Ce dossier regroupe l’ensemble des microservices Node.js (Express) qui ont remplacé le monolithe historique. Chaque service possède son propre `package.json`, un `src/` autonome, des tests et un `Dockerfile`. Les dépendances communes (constants, auth, Mongo, observabilité, domaines métiers) proviennent de `packages/`.

Services actifs :

1. `auth-service`
2. `catalog-service`
3. `order-service`
4. `settings-service`
5. `notification-service`
6. `delivery-service`
7. `api-gateway`

Le monolithe `SAT-AND-BUY-BACKEND` a été archivé dans `archive/SAT-AND-BUY-BACKEND` pour référence uniquement ; aucun service ne le consomme encore.
