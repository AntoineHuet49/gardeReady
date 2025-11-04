# Configuration GitHub Actions pour Railway

Ce dossier contient les workflows GitHub Actions pour automatiser le déploiement sur Railway.

## Workflows disponibles

### 1. `deploy-railway.yml` - Déploiement complet
- Tests et build automatiques
- Déploiement de l'API et du client
- Utilise le CLI Railway

### 2. `simple-deploy.yml` - Déploiement simple
- Déclenchement via webhook Railway
- Plus simple à configurer
- Recommandé pour débuter

## Configuration des secrets GitHub

Pour que les workflows fonctionnent, vous devez configurer les secrets suivants dans votre repository GitHub :

### Méthode 1 : CLI Railway (deploy-railway.yml)

1. Allez dans **Settings** → **Secrets and variables** → **Actions** de votre repo GitHub
2. Ajoutez ces secrets :

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `RAILWAY_TOKEN` | Token d'authentification Railway | `railway login` puis `railway whoami --token` |
| `RAILWAY_API_SERVICE_ID` | ID du service API | Dans Railway, Settings du service API |
| `RAILWAY_CLIENT_SERVICE_ID` | ID du service Client | Dans Railway, Settings du service Client |

### Méthode 2 : Webhook Railway (simple-deploy.yml)

1. Dans Railway, allez dans **Settings** → **Webhooks** de votre projet
2. Créez un nouveau webhook avec l'URL de déploiement
3. Ajoutez le secret dans GitHub :

| Secret | Description |
|--------|-------------|
| `RAILWAY_WEBHOOK_URL` | URL du webhook Railway |

## Instructions de configuration

### Étape 1 : Obtenir le token Railway

```bash
# Installez le CLI Railway
npm install -g @railway/cli

# Connectez-vous
railway login

# Obtenez votre token
railway whoami --token
```

### Étape 2 : Obtenir les IDs des services

1. Connectez-vous sur [railway.app](https://railway.app)
2. Ouvrez votre projet
3. Pour chaque service (API, Client) :
   - Cliquez sur le service
   - Allez dans **Settings**
   - Copiez l'ID affiché

### Étape 3 : Configurer les secrets GitHub

1. Sur GitHub, allez dans votre repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez **New repository secret**
4. Ajoutez chaque secret un par un

## Déploiement automatique Railway (recommandé)

Railway peut déployer automatiquement à chaque push sans GitHub Actions :

1. Dans Railway, liez votre repository GitHub
2. Configurez le déploiement automatique
3. Railway détectera les changements automatiquement

Dans ce cas, les GitHub Actions servent uniquement pour :
- Tests automatiques
- Notifications
- Déploiements conditionnels

## Test des workflows

Pour tester vos workflows :

1. Commitez et pushez sur `main`
2. Allez dans **Actions** de votre repo GitHub
3. Surveillez l'exécution du workflow
4. Vérifiez les logs en cas d'erreur

## Dépannage

### Erreur d'authentification Railway
- Vérifiez que `RAILWAY_TOKEN` est correct
- Régénérez le token si nécessaire

### Service non trouvé
- Vérifiez les IDs des services dans Railway
- Assurez-vous que les services existent

### Échec de build
- Vérifiez les logs du workflow
- Testez le build localement d'abord

## Désactivation temporaire

Pour désactiver temporairement les déploiements automatiques :

1. Renommez le fichier workflow (ajoutez `.disabled`)
2. Ou commentez les étapes de déploiement
3. Ou configurez des conditions dans le workflow