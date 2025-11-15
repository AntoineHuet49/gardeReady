# 🏗️ Configuration O2switch - Guide complet

## 📋 Secrets GitHub requis

Configurez ces secrets dans **Settings** → **Secrets and variables** → **Actions** :

### 🔐 Connexion FTP O2switch
```
FTP_SERVER=ftp.votre-domaine.com
FTP_USERNAME=votre-nom-utilisateur-ftp
FTP_PASSWORD=votre-mot-de-passe-ftp
```

### 🗄️ Base de données O2switch
```
DATABASE_URL=postgresql://utilisateur:motdepasse@localhost:5432/nom_base
# OU pour MySQL :
DATABASE_URL=mysql://utilisateur:motdepasse@localhost:3306/nom_base
```

### 🔑 Application
```
JWT_SECRET=votre-clé-jwt-très-sécurisée-32-caractères-minimum
API_URL=https://verifeu.fr/api
FRONTEND_URL=https://verifeu.fr
```

### 📧 Mailjet (optionnel)
```
MAILJET_API_KEY=votre-clé-api-mailjet
MAILJET_SECRET_KEY=votre-clé-secrète-mailjet
```

## 🏠 Structure sur O2switch

Le déploiement créera cette structure sur votre serveur :

```
/www/
├── api/                    # API Node.js
│   ├── dist/              # Code compilé
│   ├── package.json
│   ├── .env               # Variables d'environnement
│   └── ...
├── client/                # Client React
│   ├── dist/              # Build de production
│   ├── .env               # Variables d'environnement
│   └── ...
└── database/              # Scripts SQL
    └── initdb/
        └── init-deployment.sql
```

## ⚙️ Configuration serveur O2switch

### 1. Base de données

#### PostgreSQL (recommandé)
1. Dans votre panel O2switch, créez une base PostgreSQL
2. Notez les informations de connexion
3. Importez le script `database/initdb/init-deployment.sql`

#### MySQL (alternative)
1. Créez une base MySQL dans le panel
2. Adaptez le script SQL si nécessaire

### 2. Node.js et npm

O2switch supporte Node.js. Vérifiez que votre hébergement inclut :
- Node.js 18+
- npm
- Support des applications Node.js

### 3. Configuration du domaine

#### API Backend
- URL : `https://verifeu.fr/api`
- Point d'entrée : `/www/api/dist/app.js`

#### Client Frontend  
- URL : `https://verifeu.fr`
- Répertoire : `/www/client/dist/`

### 4. Fichier .htaccess pour le client

Créez `/www/client/dist/.htaccess` :

```apache
# Redirection pour React Router
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache des assets
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## 🚀 Processus de déploiement

1. **Push sur main** → Déclenchement automatique
2. **Build API et Client** → Compilation en mode production
3. **Création des .env** → Variables d'environnement
4. **Upload FTP** → Transfert vers O2switch
5. **Site en ligne** → Application accessible

## 🔧 Configuration locale pour test

Pour tester en local avec les paramètres O2switch :

```bash
# API
cd Sources/api
cp .env.example .env
# Éditez .env avec vos paramètres O2switch
npm run dev

# Client
cd Sources/client  
cp .env.example .env
# Éditez .env avec l'URL de votre API
npm run dev
```

## 📊 Surveillance et logs

### Logs O2switch
- Consultez les logs dans votre panel O2switch
- Surveillez l'utilisation des ressources

### Monitoring application
- Vérifiez les erreurs dans les logs du serveur
- Testez régulièrement les endpoints API

## 🆘 Dépannage

### Problèmes courants

1. **Erreur de connexion base de données**
   - Vérifiez `DATABASE_URL`
   - Confirmez que la base existe

2. **Erreurs CORS**
   - Vérifiez `FRONTEND_URL` dans l'API
   - Confirmez les domaines autorisés

3. **Client ne se charge pas**
   - Vérifiez `VITE_API_URL`
   - Confirmez le fichier `.htaccess`

4. **Upload FTP échoue**
   - Vérifiez les identifiants FTP
   - Confirmez les permissions de dossier

### Commandes utiles

```bash
# Tester la connexion FTP
ftp votre-domaine.com

# Vérifier les builds localement
cd Sources/api && npm run build
cd Sources/client && npm run build
```

---

**Votre application sera accessible sur `https://votre-domaine.com` ! 🎉**