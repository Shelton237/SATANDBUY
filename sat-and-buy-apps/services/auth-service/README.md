# Auth Service

Service d'authentification (admins + clients) extrait du monolithe Sat & Buy.

## Démarrage local

```bash
cd services/auth-service
cp .env.example .env
npm install
npm run dev
```

Le service écoute sur `http://localhost:6001`.

### Principaux endpoints

- `POST /auth/admin/login`
- `POST /auth/admin/register-direct`
- `POST /auth/customer/login`
- `POST /auth/customer/register`
- `POST /auth/token/refresh`

## Docker

```bash
docker build -t satandbuy-auth .
docker run --env-file ../../env/auth-service.dev.env -p 6001:6001 satandbuy-auth
```
