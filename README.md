# SATandBUY - Architecture Microservices

Bienvenue dans le projet **SATandBUY**, une architecture microservices conçue pour assurer évolutivité, modularité et robustesse.

## 📌 Vue d'ensemble
Ce projet est structuré autour de plusieurs microservices indépendants avec :
- **API Gateway** : gestion centralisée des requêtes et sécurité.
- **Service Discovery** : découverte dynamique des services.
- **Communication inter-services** : via REST, gRPC ou RabbitMQ.
- **Conteneurisation et orchestration** : Docker et Kubernetes.

---

## 📁 Structure du projet
### 🏗 **Microservices**
1. **SAT-AND-BUY-BACKEND** 
   - Backend principal (auth, logique métier, base de données).
2. **SAT-AND-BUY-STORE** 
   - Interface client basée sur **Next.js**.
3. **SAT-AND-BUY-CONSOLE** 
   - Interface admin construite avec **Vite.js**.

### 🚀 **Technologies utilisées**
- **Backend** : NestJS, Express.js, Fastify
- **Frontend** : Next.js (Store), Vite.js (Console)
- **Base de données** : PostgreSQL, MongoDB
- **API Gateway** : Kong, Traefik, Express Gateway
- **Service Discovery** : Consul, Eureka
- **Communication** : HTTP REST, gRPC, RabbitMQ
- **Conteneurisation** : Docker & Kubernetes

---

## 🔧 Installation et exécution
### Prérequis
- Node.js & Yarn
- Docker & Docker Compose
- PostgreSQL/MongoDB (suivant votre choix de BD)

### 🔹 Étapes d’installation
1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-repo/SATandBUY.git
   cd SATandBUY
   ```
2. **Installer les dépendances**
   ```bash
   yarn install
   ```
3. **Démarrer les services**
   ```bash
   docker-compose up -d
   ```
4. **Accéder aux applications**
   - API Gateway : `http://localhost:8000`
   - Store (Next.js) : `http://localhost:3000`
   - Console Admin (Vite.js) : `http://localhost:4000`

---

## 🔄 Déploiement
Nous utilisons **Docker** et **Kubernetes** pour la gestion des services.
1. **Construire les images Docker**
   ```bash
   docker build -t satandbuy-backend ./SAT-AND-BUY-BACKEND
   ```
2. **Déploiement Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

---

## 🏗 **Mise en place de l'architecture microservices**  

### 🔹 **1. Définition des microservices**
1. **API Gateway** → Point d'entrée unique pour les requêtes  
2. **Service Discovery** → Gestion automatique des microservices  
3. **Auth Service** → Gestion des utilisateurs et JWT  
4. **Product Service** → Gestion des produits  
5. **Order Service** → Gestion des commandes  
6. **Payment Service** → Gestion des paiements  

### 🔹 **2. Choix des technologies**
#### **Backend**
- **NestJS** (facilité de mise en place des API et microservices)
- **Express.js** ou **Fastify** pour certains microservices spécifiques  
- **PostgreSQL/MongoDB** pour la gestion des bases de données  

#### **Frontend**
- **Next.js** (Store - Client)  
- **Vite.js** (Console - Admin)  

#### **Communication**
- **REST API** (HTTP)  
- **gRPC** pour des services performants  
- **RabbitMQ** pour la communication asynchrone entre services  

#### **Orchestration & Conteneurisation**
- **Docker** pour conteneuriser les services  
- **Kubernetes** pour la gestion du déploiement et du scaling  

---

### 🔹 **3. Mise en place de l'API Gateway**
1. **Installation d'Express Gateway**
   ```bash
   npm install -g express-gateway
   eg gateway create api-gateway
   cd api-gateway
   npm start
   ```
2. **Configuration des routes** (fichier `gateway.config.yml`)
   ```yaml
   pipelines:
     - name: product-service
       apiEndpoints:
         - products
       policies:
         - proxy:
             - action:
                 serviceEndpoint: product-service
                 changeOrigin: true
   serviceEndpoints:
     product-service:
       url: http://localhost:5001
   ```

---

### 🔹 **4. Implémentation du Service Discovery**
1. **Installation de Consul**
   ```bash
   docker run -d --name=consul -p 8500:8500 consul agent -dev
   ```
2. **Enregistrement des services**
   ```typescript
   import { Client } from 'consul';
   
   const consul = new Client();
   consul.agent.service.register({
     name: 'product-service',
     address: 'localhost',
     port: 5001
   });
   ```

---

### 🔹 **5. Communication entre microservices**
1. **Installation de RabbitMQ**
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
   ```
2. **Envoi de messages**
   ```typescript
   import amqplib from 'amqplib';
   
   async function sendMessage(queue, message) {
     const connection = await amqplib.connect('amqp://localhost');
     const channel = await connection.createChannel();
     await channel.assertQueue(queue);
     channel.sendToQueue(queue, Buffer.from(message));
   }
   ```

---

### 📌 **Prochaines étapes**
1. **Configurer une CI/CD** avec **GitHub Actions**  
2. **Mettre en place le monitoring** avec **Prometheus et Grafana**  
3. **Optimiser la scalabilité** en ajoutant **autoscaling Kubernetes**  

---

## 🤝 Contribuer
Toute contribution est la bienvenue ! Merci de :
- **Forker** ce projet
- Créer une **Pull Request** avec vos améliorations
- Signaler des bugs via **Issues**

---

## 📄 Licence
Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus d’informations.