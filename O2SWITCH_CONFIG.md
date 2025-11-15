# 🎯 Configuration spécifique à votre O2switch

## ✅ Informations de votre serveur

**Serveur O2switch :** cerisier.o2switch.net  
**Compte :** pidu0234  
**cPanel :** https://cerisier.o2switch.net:2083

## 🔧 Configuration dans cPanel

### 1. Base de données
1. Connectez-vous au cPanel : https://cerisier.o2switch.net:2083
2. **MySQL Databases** ou **PostgreSQL Databases**
3. Créez une nouvelle base : `pidu0234_gardeready`
4. Créez un utilisateur : `pidu0234_garde`
5. Assignez l'utilisateur à la base avec tous les privilèges

### 2. Node.js (si supporté)
1. Dans cPanel, cherchez **Node.js** ou **Node.js Apps**
2. Créez une nouvelle application Node.js
3. **App Root** : `/public_html/api`
4. **Startup File** : `dist/app.js`
5. **Node.js Version** : 18.x

### 3. Structure recommandée
```
/public_html/
├── index.html              # Page d'accueil (redirection)
├── api/                    # API Node.js
│   ├── dist/app.js        # Point d'entrée
│   ├── package.json
│   └── .env
└── app/                    # Client React (ou dans un sous-domaine)
    ├── index.html
    ├── assets/
    └── .htaccess
```

## 🗄️ Configuration base de données

Une fois la base créée, votre `DATABASE_URL` sera :

```bash
# MySQL
DATABASE_URL=mysql://pidu0234_garde:mot_de_passe@localhost:3306/pidu0234_gardeready

# PostgreSQL (si disponible)
DATABASE_URL=postgresql://pidu0234_garde:mot_de_passe@localhost:5432/pidu0234_gardeready
```

## 🚀 Déploiement optimisé

Le workflow déploiera dans `/public_html/` mais vous devrez peut-être :

1. **Copier le client** vers la racine pour l'accès direct
2. **Configurer un sous-domaine** api.votre-domaine.com pour l'API
3. **Ajuster les chemins** selon la structure O2switch

## 🔗 URLs finales

- **Site web** : https://votre-domaine.com
- **API** : https://votre-domaine.com/api (ou api.votre-domaine.com)
- **cPanel** : https://cerisier.o2switch.net:2083

## 📞 Support O2switch

Si vous avez des questions sur la configuration Node.js ou les bases de données, contactez le support O2switch avec vos identifiants de compte.

---

**Prêt pour le déploiement ! 🎉**