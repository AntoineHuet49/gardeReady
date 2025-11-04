# 🔧 Configuration Railway - Guide étape par étape

## ⚠️ Important : Configuration préalable requise

Avant que le déploiement automatique fonctionne, vous devez configurer Railway manuellement **une première fois**.

### Étape 1 : Créer le projet Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous et cliquez **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Choisissez votre repository `gardeReady`

### Étape 2 : Configurer les services

Railway va détecter automatiquement votre structure. Vous devez créer **3 services** :

#### Service 1 : Base de données
1. Cliquez **"Add Service"** → **"Database"** → **"PostgreSQL"**
2. Railway créera automatiquement la base de données

#### Service 2 : API Backend
1. Cliquez **"Add Service"** → **"GitHub Repo"**
2. **Root Directory** : `Sources/api`
3. Railway utilisera automatiquement `railway.toml`

#### Service 3 : Client Frontend  
1. Cliquez **"Add Service"** → **"GitHub Repo"**
2. **Root Directory** : `Sources/client`
3. Railway utilisera automatiquement `railway.toml`

### Étape 3 : Variables d'environnement

Pour chaque service, configurez les variables :

#### API (Sources/api) :
```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=votre-clé-jwt-sécurisée
FRONTEND_URL=https://votre-client-url.railway.app
```

#### Client (Sources/client) :
```
NODE_ENV=production
VITE_API_URL=https://votre-api-url.railway.app
```

### Étape 4 : Premier déploiement manuel

1. Cliquez **"Deploy"** sur chaque service manuellement
2. Attendez que tous les services soient déployés
3. Notez les URLs générées

### Étape 5 : Mise à jour des URLs croisées

1. Mettez à jour `FRONTEND_URL` dans l'API avec l'URL du client
2. Mettez à jour `VITE_API_URL` dans le client avec l'URL de l'API
3. Redéployez les services

### Étape 6 : Activer le déploiement automatique

1. Dans chaque service, allez dans **Settings**
2. Activez **"Auto Deploy"** 
3. Sélectionnez la branche **"main"**

## ✅ Après cette configuration

Le workflow GitHub Actions fonctionnera automatiquement car :
- Railway connaît votre projet
- Les services sont liés au repository
- Le CLI `railway up` saura quoi déployer

## 🚀 Alternative : Déploiement automatique Railway

Si vous activez le déploiement automatique dans Railway, vous n'avez même pas besoin du workflow GitHub Actions ! Railway déploiera automatiquement à chaque push sur `main`.

Dans ce cas, le workflow GitHub Actions sert uniquement de :
- Validation des builds
- Tests automatiques
- Backup de déploiement