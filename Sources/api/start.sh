#!/bin/bash

# Script de démarrage pour O2switch
# Ce script sera exécuté sur le serveur pour démarrer l'API Node.js

echo "🚀 Démarrage de l'API GardeReady..."

# Vérification que Node.js est disponible
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérification que npm est disponible  
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Aller dans le dossier API
cd /www/api

# Vérification que les fichiers existent
if [ ! -f "package.json" ]; then
    echo "❌ package.json non trouvé"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ Fichier .env non trouvé"
    exit 1
fi

if [ ! -d "dist" ]; then
    echo "❌ Dossier dist non trouvé"
    exit 1
fi

# Installation des dépendances de production
echo "📦 Installation des dépendances..."
npm ci --production

# Démarrage de l'application
echo "✅ Démarrage de l'API sur le port 3000..."
NODE_ENV=production node dist/app.js