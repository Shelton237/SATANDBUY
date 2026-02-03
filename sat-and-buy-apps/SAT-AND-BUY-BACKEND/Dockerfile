# Utilisation de Node.js 18
FROM node:18

# Définir le dossier de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour optimiser le cache Docker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copier le reste des fichiers
COPY . .

# Exposer le port du backend
EXPOSE 5000

# Définir les variables d’environnement
ENV EUREKA_HOST=eureka-server
ENV EUREKA_PORT=8761
ENV MONGO_URI=mongodb://mongo:27017/satandbuy_db

# Lancer l’application
CMD ["npm", "start"]
