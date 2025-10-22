# Étape 1 : Utilise une image officielle Node.js comme base
FROM node:22-alpine

# Étape 2 : Crée un dossier de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 4 : Installe toutes les dépendances
ENV NODE_ENV=development
RUN npm ci

# Étape 5 : Copie le reste des fichiers de l'application
COPY . .

# Étape 6 : Expose le port sur lequel l'API va tourner
EXPOSE 3000

# Étape 7 : Démarre l'application
CMD ["npm", "run", "dev"]