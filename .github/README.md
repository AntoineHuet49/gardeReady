# GitHub Actions - CI/CD Railway

Ce dossier contient le workflow GitHub Actions pour automatiser le déploiement sur Railway.

## Workflow : `deploy.yml`

Workflow simple qui :
- Se déclenche à chaque push sur `main`
- Peut être déclenché manuellement
- Déploie automatiquement sur Railway

## Configuration requise

### Secret GitHub

Vous devez configurer **un seul secret** dans votre repository GitHub :

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Cliquez **New repository secret**
3. Ajoutez :

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `RAILWAY_TOKEN` | Token d'authentification Railway | `railway login` puis `railway whoami --token` |

### Obtenir le token Railway

```bash
# Installez le CLI Railway (si pas déjà fait)
npm install -g @railway/cli

# Connectez-vous
railway login

# Obtenez votre token
railway whoami --token
```

## Utilisation

1. **Configuration du secret** : Ajoutez `RAILWAY_TOKEN` dans GitHub
2. **Push automatique** : Chaque push sur `main` déclenche le déploiement
3. **Déploiement manuel** : Allez dans Actions → Deploy → Run workflow

## Alternative recommandée : Déploiement automatique Railway

Railway peut déployer automatiquement sans GitHub Actions :

1. Dans Railway, connectez votre repository GitHub
2. Railway détecte automatiquement les push sur `main`
3. Déploiement automatique sans configuration supplémentaire

Dans ce cas, GitHub Actions sert uniquement de backup ou pour des déploiements conditionnels.

## Surveillance

- Surveillez les déploiements dans l'onglet **Actions** de GitHub
- Vérifiez les logs en cas d'erreur
- Consultez Railway pour l'état des services