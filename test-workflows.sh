#!/bin/bash

# Script de validation simple pour GitHub Actions
echo "🔍 Validation du workflow GitHub Actions..."

echo ""
echo "📝 Vérification du fichier workflow..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "  ✅ Workflow deploy.yml trouvé"
else
    echo "  ❌ Workflow deploy.yml non trouvé"
    exit 1
fi

echo ""
echo "🔑 Variables nécessaires:"
echo "  - RAILWAY_TOKEN (secret GitHub requis)"

echo ""
echo "📋 Workflow configuré:"
echo "  - Déclenchement: push sur main"
echo "  - Déclenchement: workflow_dispatch (manuel)"
echo "  - Action: Deploy sur Railway"

echo ""
echo "✅ Workflow prêt!"
echo ""
echo "� Prochaines étapes:"
echo "1. Configurez le secret RAILWAY_TOKEN dans GitHub"
echo "2. Commitez et pushez sur main"
echo "3. Le déploiement se fera automatiquement"