# Fichier : SAT-AND-BUY-CONSOLE/Dockerfile

FROM node:18

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances en premier (optimisation du cache Docker)
COPY package*.json ./

# Installe toutes les dépendances, y compris les devDependencies
RUN npm install

# Copie le reste du code source
COPY . .

# Génère le build statique de Vite.js
RUN npm run build

# Utilisation d'un serveur web léger pour servir les fichiers en production
RUN npm install -g serve

# Expose le port utilisé par l'application
EXPOSE 4000

# Définit l'utilisateur non-root pour des raisons de sécurité
USER node

# Commande de démarrage
CMD ["serve", "-s", "dist", "-l", "4000"]