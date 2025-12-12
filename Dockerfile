# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/Sources/client

# Copie package.json et package-lock.json
COPY Sources/client/package*.json ./

# Installe les dépendances
RUN npm install

# Copie le code source
COPY Sources/client .

# Build l'application
RUN npm run build

# Stage 2: Build API
FROM node:22-alpine AS api-builder

WORKDIR /app/Sources/api

# Copie package.json et package-lock.json
COPY Sources/api/package*.json ./

# Installe les dépendances
RUN npm install

# Copie le code source
COPY Sources/api .

# Build l'application
RUN npm run build

# Stage 3: Runtime
FROM node:22-alpine

WORKDIR /app

# Copie le build API depuis le stage 2
COPY --from=api-builder /app/Sources/api/dist ./Sources/api/dist
COPY --from=api-builder /app/Sources/api/node_modules ./Sources/api/node_modules
COPY --from=api-builder /app/Sources/api/package.json ./Sources/api/package.json

# Copie le build frontend depuis le stage 1
COPY --from=frontend-builder /app/Sources/client/dist ./Sources/api/public

# Expose le port
EXPOSE 8080

# Démarre l'API
CMD ["node", "Sources/api/dist/app.js"]
