# Étape 1 : Utiliser l'image Node.js 22 basée sur Alpine
FROM node:22-alpine

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers de dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances de développement
RUN npm install

# Étape 5 : Copier le reste du code de l'application
COPY . .

# Étape 6 : Exposer le port sur lequel l'application s'exécute
EXPOSE 3000

# Étape 7 : Démarrer l'application en mode développement
CMD ["npm", "run", "start:dev"]
