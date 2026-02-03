# Fichier : SAT-AND-BUY-STORE/Dockerfile

FROM node:18

# Définit le répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installe toutes les dépendances, y compris les devDependencies
RUN npm install

# Copie du code source
COPY . .

# Génère le build optimisé pour la production
RUN npm run build

# Expose le port utilisé par l'application Next.js
EXPOSE 3000

# Définit un utilisateur non-root pour la sécurité
USER node

# Démarre Next.js en mode production
CMD ["npm", "run", "start"]