# 🔑 Configuration SSH GitHub Actions → O2switch

## 🚀 Avantages du déploiement SSH

- ✅ **Plus sécurisé** : Authentification par clé SSH
- ✅ **Plus rapide** : rsync au lieu de FTP
- ✅ **Plus fiable** : Connexions SSH stables
- ✅ **Plus flexible** : Commandes shell directes
- ✅ **Pas de mots de passe** dans les secrets

## 🔧 Configuration SSH GitHub Actions → O2switch

### 1. Générer une paire de clés SSH POUR GITHUB ACTIONS

```bash
# Générer une clé spécifique pour le déploiement GitHub → O2switch
ssh-keygen -t ed25519 -C "github-actions@verifeu.fr" -f ./github-o2switch-deploy
# ⚠️ PAS de passphrase pour GitHub Actions !
```

### 2. Ajouter la clé publique dans O2switch

1. **Copiez la clé publique** :
   ```bash
   cat ./github-o2switch-deploy.pub
   ```

2. **Dans le panel O2switch** :
   - Section "SSH/SFTP" ou "Sécurité"
   - "Clés SSH autorisées" ou "Authorized Keys"
   - Collez le contenu de la clé publique

### 3. Configurer les secrets GitHub

Dans GitHub Settings → Secrets and Variables → Actions :

```bash
SSH_HOST=cerisier.o2switch.net
SSH_USER=pidu0234
SSH_PRIVATE_KEY=<contenu-de-la-clé-privée>
```

Pour obtenir le contenu de la clé privée :
```bash
cat ./github-o2switch-deploy
```

**⚠️ Important** : Copiez TOUT le contenu, y compris les lignes :
```
-----BEGIN OPENSSH PRIVATE KEY-----
...contenu...
-----END OPENSSH PRIVATE KEY-----
```

### 4. Tester la connexion (optionnel)

```bash
# Test local pour vérifier que la clé fonctionne
ssh -i ./github-o2switch-deploy pidu0234@cerisier.o2switch.net
```

## 🔄 Migration du déploiement

### Option 1: Utiliser le nouveau workflow SSH

1. **Renommez les workflows** :
   ```bash
   mv .github/workflows/deploy.yml .github/workflows/deploy-ftp.yml.backup
   mv .github/workflows/deploy-ssh.yml .github/workflows/deploy.yml
   ```

2. **Configurez les secrets SSH** dans GitHub

3. **Testez le déploiement**

### Option 2: Garder les deux workflows

- `deploy-ftp.yml` : Déploiement FTP (backup)
- `deploy-ssh.yml` : Déploiement SSH (principal)

## 🎯 Avantages du nouveau workflow SSH

1. **rsync** : Synchronisation intelligente (seulement les fichiers modifiés)
2. **Commandes directes** : Installation des dépendances sur le serveur
3. **Gestion des processus** : Redémarrage automatique de l'API Node.js
4. **Logs** : Meilleur debugging en cas de problème

## 🔧 Commandes SSH utiles sur O2switch

```bash
# Se connecter
ssh pidu0234@cerisier.o2switch.net

# Vérifier les processus Node.js
ps aux | grep node

# Voir les logs de l'API
tail -f /public_html/api/api.log

# Redémarrer l'API manuellement
cd /public_html/api
pkill -f "node.*app.js"
nohup node app.js > api.log 2>&1 &
```

## ⚠️ Sécurité

- ✅ La clé privée reste dans GitHub Secrets (chiffrée)
- ✅ Pas de mots de passe en clair
- ✅ Connexions chiffrées
- ✅ Authentification forte

---

**Le déploiement SSH sera plus rapide et plus sécurisé ! 🚀**