# 🚀 Déploiement O2switch - Guide rapide

## ✅ Configuration terminée !

Votre application est maintenant configurée pour se déployer automatiquement sur votre serveur O2switch.

## 🔑 Secrets GitHub à configurer

Dans **Settings** → **Secrets and variables** → **Actions**, ajoutez :

### Connexion FTP
- `FTP_SERVER` : ftp.votre-domaine.com
- `FTP_USERNAME` : votre nom d'utilisateur FTP
- `FTP_PASSWORD` : votre mot de passe FTP

### Base de données O2switch
- `DATABASE_URL` : postgresql://user:pass@localhost:5432/db_name

### Application
- `JWT_SECRET` : clé sécurisée de 32+ caractères
- `API_URL` : https://votre-domaine.com/api
- `FRONTEND_URL` : https://votre-domaine.com

### Email (optionnel)
- `MAILJET_API_KEY` : clé API Mailjet
- `MAILJET_SECRET_KEY` : clé secrète Mailjet

## 🏗️ Ce qui sera déployé

```
votre-serveur.com/
├── api/                   # Backend Node.js
│   ├── dist/             # Code compilé
│   ├── .env              # Variables d'environnement
│   └── start.sh          # Script de démarrage
└── client/               # Frontend React
    ├── dist/             # Site web optimisé
    └── .htaccess         # Configuration Apache
```

## 🚀 Déploiement

1. **Configurez les secrets** dans GitHub
2. **Pushez sur main** :
   ```bash
   git add .
   git commit -m "feat: Configuration O2switch"
   git push origin main
   ```
3. **Surveillez le déploiement** dans Actions
4. **Votre site sera en ligne** sur votre domaine !

## 📊 Après le déploiement

### Sur O2switch
1. **Base de données** : Importez `database/initdb/init-deployment.sql`
2. **Node.js** : Démarrez l'API avec `bash /www/api/start.sh`
3. **Apache** : Le client sera accessible automatiquement

### Compte admin par défaut
- Email : `admin@gardeready.com`
- Mot de passe : `AdminReady2024!`

⚠️ **Changez ce mot de passe après le premier déploiement !**

## 🔧 Dépannage

- **Build échoue** : Vérifiez les logs dans GitHub Actions
- **FTP échoue** : Vérifiez les identifiants FTP
- **Site ne charge pas** : Vérifiez la configuration Apache et Node.js
- **API ne répond pas** : Vérifiez la base de données et les variables d'environnement

---

**Documentation complète** : Consultez `O2SWITCH_SETUP.md` pour plus de détails.

**Votre application sera accessible sur `https://votre-domaine.com` ! 🎉**