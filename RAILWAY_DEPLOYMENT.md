# Guide de déploiement sur Railway

Ce guide vous explique comment déployer l'application GardeReady sur Railway.

## Prérequis

1. Compte Railway (https://railway.app)
2. Code source pushé sur GitHub
3. CLI Railway installé (optionnel) : `npm install -g @railway/cli`

## Architecture de déploiement

L'application se compose de 3 services :
- **API Backend** (Node.js/Express)
- **Frontend** (React/Vite)  
- **Base de données** (PostgreSQL)

## Étapes de déploiement

### 1. Créer un nouveau projet Railway

1. Connectez-vous à https://railway.app
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Choisissez votre repository `gardeReady`

### 2. Déployer la base de données PostgreSQL

1. Dans votre projet Railway, cliquez sur "Add Service"
2. Sélectionnez "Database" → "PostgreSQL"
3. Railway créera automatiquement une base de données PostgreSQL
4. Notez les variables d'environnement générées (DATABASE_URL, etc.)

### 3. Déployer l'API Backend

1. Cliquez sur "Add Service" → "GitHub Repo"
2. Sélectionnez votre repository
3. Définissez le **Root Directory** : `Sources/api`
4. Railway détectera automatiquement le `railway.toml`

#### Variables d'environnement pour l'API :

```env
NODE_ENV=production
PORT=$PORT
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=votre-clé-jwt-très-sécurisée
FRONTEND_URL=https://votre-frontend.railway.app
MAILJET_API_KEY=votre-clé-mailjet
MAILJET_SECRET_KEY=votre-clé-secrète-mailjet
```

**Important** : Remplacez `votre-clé-jwt-très-sécurisée` par une clé aléatoire sécurisée !

### 4. Déployer le Frontend

1. Cliquez sur "Add Service" → "GitHub Repo"
2. Sélectionnez votre repository
3. Définissez le **Root Directory** : `Sources/client`
4. Railway détectera automatiquement le `railway.toml`

#### Variables d'environnement pour le Frontend :

```env
NODE_ENV=production
VITE_API_URL=https://votre-api.railway.app
```

### 5. Configuration finale

1. **Récupérez les URLs** : Chaque service aura une URL unique (ex: `https://xyz.railway.app`)
2. **Mettez à jour les variables d'environnement** :
   - Dans l'API : `FRONTEND_URL` = URL du frontend
   - Dans le Frontend : `VITE_API_URL` = URL de l'API
3. **Redéployez** les services pour appliquer les changements

## Initialisation de la base de données

Deux scripts SQL sont disponibles :

1. **`Sources/database/initdb/init.sql`** - Script complet avec données de test
2. **`Sources/database/initdb/init-deployment.sql`** - Script optimisé pour le déploiement (recommandé)

Le script de déploiement contient :
- Toutes les tables nécessaires
- Un compte administrateur par défaut :
  - **Email** : `admin@gardeready.com`
  - **Mot de passe** : `AdminReady2024!`
  - **Rôle** : `admin`

### Changer le mot de passe admin

Pour générer un nouveau hash de mot de passe :

```bash
cd Sources/database
node generate-password-hash.js "VotreNouveauMotDePasse"
```

Puis remplacez le hash dans `init-deployment.sql`.

### Configuration Railway

Dans Railway, la base de données PostgreSQL utilisera automatiquement le script d'initialisation. Pour utiliser le script de déploiement :

1. Renommez `init-deployment.sql` en `init.sql`
2. Ou modifiez votre configuration pour pointer vers le bon script

## GitHub Actions - Déploiement automatique

Ce projet inclut des workflows GitHub Actions pour automatiser le déploiement :

### Configuration rapide

1. **Déploiement automatique Railway** (recommandé) :
   - Connectez votre repo GitHub dans Railway
   - Railway déploie automatiquement à chaque push sur `main`
   - Aucune configuration supplémentaire nécessaire

2. **GitHub Actions + Railway CLI** :
   - Configurez les secrets GitHub (voir `.github/README.md`)
   - Les workflows testent et déploient automatiquement

### Secrets GitHub requis

Pour utiliser les GitHub Actions, ajoutez ces secrets dans **Settings** → **Secrets** de votre repo :

- `RAILWAY_TOKEN` : Token d'authentification Railway
- `RAILWAY_API_SERVICE_ID` : ID du service API  
- `RAILWAY_CLIENT_SERVICE_ID` : ID du service Client

Consultez `.github/README.md` pour les instructions détaillées.

## Surveillance et logs

- Accédez aux logs via l'interface Railway
- Surveillez l'utilisation des ressources
- Configurez des alertes si nécessaire

## Domaine personnalisé (optionnel)

1. Dans Railway, accédez aux paramètres de votre service frontend
2. Cliquez sur "Settings" → "Domains"
3. Ajoutez votre domaine personnalisé
4. Mettez à jour la variable `FRONTEND_URL` de l'API

## Dépannage

### Erreurs courantes :

1. **CORS Error** : Vérifiez que `FRONTEND_URL` est correctement définie dans l'API
2. **Database Connection** : Vérifiez que `DATABASE_URL` est correctement définie
3. **Build Fails** : Vérifiez les logs de build dans Railway

### Commandes utiles :

```bash
# Connecter CLI Railway
railway login

# Voir les logs
railway logs

# Redéployer un service
railway up

# Voir les variables d'environnement
railway variables
```

## Sécurité

- [ ] Générez une clé JWT sécurisée unique
- [ ] Configurez correctement les variables Mailjet
- [ ] Limitez les origines CORS aux domaines nécessaires
- [ ] Activez HTTPS (automatique sur Railway)

## Maintenance

- Les déploiements se font automatiquement lors des push sur la branche principale
- Surveillez régulièrement les logs et performances
- Mettez à jour les dépendances régulièrement

---

Pour toute question, consultez la documentation Railway : https://docs.railway.app