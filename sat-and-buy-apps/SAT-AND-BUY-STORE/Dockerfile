# File: SAT-AND-BUY-STORE/Dockerfile

FROM node:18

# Set working directory
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL=https://back-satbuy.dreamdigital.cm/api
ARG NEXT_PUBLIC_API_SOCKET_URL=https://back-satbuy.dreamdigital.cm
ARG NEXT_PUBLIC_STORE_DOMAIN=https://satandbuy.dreamdigital.cm
ARG NEXTAUTH_URL=https://satandbuy.dreamdigital.cm

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_SOCKET_URL=${NEXT_PUBLIC_API_SOCKET_URL}
ENV NEXT_PUBLIC_STORE_DOMAIN=${NEXT_PUBLIC_STORE_DOMAIN}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy dependency files first to leverage layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build optimized production bundle
RUN npm run build

# Expose HTTP port
EXPOSE 3000

# Security: run as non-root user
USER node

# Start Next.js in production
CMD ["npm", "run", "start"]
