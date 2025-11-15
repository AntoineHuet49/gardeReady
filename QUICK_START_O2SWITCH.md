# 🚀 Déploiement O2switch - Guide rapide

## ✅ Configuration terminée !

Votre application est maintenant configurée pour se déployer automatiquement sur votre serveur O2switch.

## 🔑 Secrets GitHub à configurer

Dans **Settings** → **Secrets and variables** → **Actions**, ajoutez :

### Connexion FTP
- `FTP_SERVER` : cerisier.o2switch.net
- `FTP_USERNAME` : pidu0234
- `FTP_PASSWORD` : u9RY-VVYg-3t8@

### Base de données O2switch
   - `DATABASE_URL` : `postgresql://pidu0234_verifeu_user:quwbuz-zuFty8-wordas@localhost:5432/pidu0234_verifeu`

### Application
- `JWT_SECRET` : clé sécurisée de 32+ caractères
- `API_URL` : https://verifeu.fr/api
- `FRONTEND_URL` : https://verifeu.fr

### Email Mailjet
- `MAILJET_API_KEY` : 13e46336d45ba9cd09447b6b15646432
- `MAILJET_SECRET_KEY` : fbca50e39145d22541608640e8709b58

## 🏗️ Ce qui sera déployé

```
/public_html/             # Racine web O2switch
├── api/                  # Backend Node.js
│   ├── dist/            # Code compilé
│   ├── .env             # Variables d'environnement
│   └── start.sh         # Script de démarrage
├── client/              # Frontend React
│   ├── dist/            # Site web optimisé
│   └── .htaccess        # Configuration Apache
└── database/            # Scripts SQL
    └── initdb/
        └── init-deployment.sql
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
3. **Importer la structure de base de données** dans le panneau O2switch :
   - Utiliser le fichier `Sources/database/initdb/init-postgresql-o2switch.sql`
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

**Votre application sera accessible sur `https://verifeu.fr` ! 🎉**