# 🔑 Configuration SSH GitHub Actions → O2switch - Guide pas à pas

## 🎯 Comprendre le flux

```
GitHub Actions ──SSH──→ O2switch
     (runner)    clé    (serveur)
```

La clé SSH permet à **GitHub Actions** (qui s'exécute sur des serveurs Ubuntu) de se connecter à **votre serveur O2switch**.

## 📋 Étapes détaillées

### Étape 1: Générer la paire de clés SSH

```bash
# Sur votre machine locale (pour la génération uniquement)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./deploy-key

# ⚠️ IMPORTANT : Pas de passphrase pour GitHub Actions !
# Appuyez sur Entrée quand demandé
```

Cela crée 2 fichiers :
- `deploy-key` (clé privée) → va dans GitHub Secrets
- `deploy-key.pub` (clé publique) → va dans O2switch

### Étape 2: Ajouter la clé publique dans O2switch

1. **Affichez la clé publique** :
   ```bash
   cat ./deploy-key.pub
   ```

2. **Copiez le contenu complet** (une seule ligne commençant par `ssh-ed25519`)

3. **Dans le panel O2switch** :
   - Allez dans "SSH" ou "Sécurité"
   - Cherchez "Clés SSH autorisées" ou "Authorized Keys"
   - Collez la clé publique

### Étape 3: Configurer GitHub Secrets

1. **Allez sur** : https://github.com/AntoineHuet49/gardeReady/settings/secrets/actions

2. **Ajoutez ces secrets** :

   **SSH_HOST**
   ```
   cerisier.o2switch.net
   ```

   **SSH_USER**
   ```
   pidu0234
   ```

   **SSH_PRIVATE_KEY**
   ```bash
   # Affichez le contenu complet de la clé privée
   cat ./deploy-key
   ```
   Copiez TOUT le contenu, y compris :
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   ...contenu...
   -----END OPENSSH PRIVATE KEY-----
   ```

### Étape 4: Tester (optionnel)

```bash
# Test de connexion avec la clé
ssh -i ./deploy-key pidu0234@cerisier.o2switch.net

# Si ça marche, vous verrez le shell O2switch
# Tapez 'exit' pour sortir
```

### Étape 5: Activer le workflow SSH

```bash
# Renommer les workflows
mv .github/workflows/deploy.yml .github/workflows/deploy-ftp-backup.yml
mv .github/workflows/deploy-ssh.yml .github/workflows/deploy.yml

# Commit et push
git add .
git commit -m "feat: Migration vers déploiement SSH"
git push origin main
```

## 🔒 Sécurité

- ✅ **Clé privée** : Stockée chiffrée dans GitHub Secrets
- ✅ **Clé publique** : Dans O2switch, associée à votre compte
- ✅ **Accès limité** : La clé ne peut que se connecter, pas d'autres droits
- ✅ **Pas de mots de passe** : Authentification par clé uniquement

## ⚠️ Points importants

1. **Pas de passphrase** sur la clé privée (GitHub Actions est automatique)
2. **Supprimez les fichiers locaux** après configuration :
   ```bash
   rm ./deploy-key ./deploy-key.pub
   ```
3. **La clé reste dans GitHub Secrets** (sécurisée et chiffrée)

---

Une fois configuré, chaque push sur `main` déploiera automatiquement via SSH ! 🚀