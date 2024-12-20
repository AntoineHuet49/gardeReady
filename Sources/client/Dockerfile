# Dockerfile pour un environnement de développement React TypeScript avec Vite

# Utiliser une image Node officielle
FROM node:22

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json ou yarn.lock
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port utilisé par Vite (par défaut 5173)
EXPOSE 5173

# Lancer le serveur de développement Vite
CMD ["npm", "run", "dev"]
