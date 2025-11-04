#!/bin/bash

# Script pour obtenir et configurer automatiquement les IDs Railway
echo "🚂 Configuration automatique Railway..."

# Vérification des prérequis
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "📦 Installez-le avec: npm install -g @railway/cli"
    exit 1
fi

echo "🔐 Connexion à Railway..."
railway login

echo ""
echo "📋 Récupération des informations du projet..."

# Obtenir l'ID du projet
PROJECT_ID=$(railway project --json 2>/dev/null | jq -r '.id' 2>/dev/null)

if [ "$PROJECT_ID" = "null" ] || [ -z "$PROJECT_ID" ]; then
    echo "❌ Aucun projet Railway trouvé"
    echo "👉 Créez d'abord un projet sur https://railway.app"
    echo "👉 Liez votre repository GitHub au projet"
    exit 1
fi

echo "✅ Projet ID: $PROJECT_ID"

# Configuration pour l'API
echo ""
echo "🔧 Configuration API..."
cd Sources/api

API_SERVICE_ID=$(railway service --json 2>/dev/null | jq -r '.id' 2>/dev/null)

if [ "$API_SERVICE_ID" = "null" ] || [ -z "$API_SERVICE_ID" ]; then
    echo "⚠️  Service API non trouvé"
    echo "👉 Créez un service API dans Railway avec Root Directory: Sources/api"
else
    echo "✅ API Service ID: $API_SERVICE_ID"
    
    # Écrire le fichier .railway.toml pour l'API
    cat > .railway.toml << EOF
# Railway project configuration for API
# Auto-généré par setup-railway-ids.sh

[project]
id = "$PROJECT_ID"

[service]
id = "$API_SERVICE_ID"
EOF
    echo "✅ Fichier .railway.toml créé pour l'API"
fi

cd ../../

# Configuration pour le Client
echo ""
echo "🎨 Configuration Client..."
cd Sources/client

CLIENT_SERVICE_ID=$(railway service --json 2>/dev/null | jq -r '.id' 2>/dev/null)

if [ "$CLIENT_SERVICE_ID" = "null" ] || [ -z "$CLIENT_SERVICE_ID" ]; then
    echo "⚠️  Service Client non trouvé"
    echo "👉 Créez un service Client dans Railway avec Root Directory: Sources/client"
else
    echo "✅ Client Service ID: $CLIENT_SERVICE_ID"
    
    # Écrire le fichier .railway.toml pour le Client
    cat > .railway.toml << EOF
# Railway project configuration for Client
# Auto-généré par setup-railway-ids.sh

[project]
id = "$PROJECT_ID"

[service]
id = "$CLIENT_SERVICE_ID"
EOF
    echo "✅ Fichier .railway.toml créé pour le Client"
fi

cd ../../

echo ""
echo "🔑 Secrets GitHub requis:"
echo "RAILWAY_TOKEN=$(railway whoami --token 2>/dev/null)"
echo "RAILWAY_PROJECT_ID=$PROJECT_ID"

if [ -n "$API_SERVICE_ID" ] && [ "$API_SERVICE_ID" != "null" ]; then
    echo "RAILWAY_API_SERVICE_ID=$API_SERVICE_ID"
fi

if [ -n "$CLIENT_SERVICE_ID" ] && [ "$CLIENT_SERVICE_ID" != "null" ]; then
    echo "RAILWAY_CLIENT_SERVICE_ID=$CLIENT_SERVICE_ID"
fi

echo ""
echo "📋 Ajoutez ces secrets dans GitHub:"
echo "👉 Repository → Settings → Secrets and variables → Actions"
echo ""
echo "✅ Configuration terminée!"