# 🔄 Organisation des workflows de déploiement

## 📁 Structure actuelle

```
.github/workflows/
├── deploy.yml              # ✅ Déploiement SSH (PRINCIPAL)
└── deploy-ftp-backup.yml   # 🔄 Déploiement FTP (BACKUP)
```

## 🎯 Stratégie de déploiement

### ✅ **Workflow principal : SSH** (`deploy.yml`)
- Plus rapide et sécurisé
- Se déclenche automatiquement sur `push main`
- Utilise rsync et commandes directes

### 🔄 **Workflow backup : FTP** (`deploy-ftp-backup.yml`)
- Fallback si SSH ne fonctionne pas
- Déclenchement manuel uniquement
- Méthode traditionnelle éprouvée

## 🔧 Utilisation

### Déploiement normal
```bash
git push origin main
# → Déclenche automatiquement deploy.yml (SSH)
```

### Déploiement de secours
1. Allez sur GitHub Actions
2. Sélectionnez "CI/CD O2switch FTP"
3. Cliquez "Run workflow"

## 💡 Avantages de garder les deux

- ✅ **Redondance** : Si SSH a un problème, FTP est disponible
- ✅ **Test** : Comparer les performances SSH vs FTP
- ✅ **Migration douce** : Transition progressive vers SSH
- ✅ **Débogage** : Diagnostiquer les problèmes de déploiement

## 🗑️ Quand supprimer deploy-ftp-backup.yml ?

Une fois que SSH fonctionne parfaitement pendant quelques déploiements :

```bash
# Supprimer le backup FTP
rm .github/workflows/deploy-ftp-backup.yml
git add .
git commit -m "cleanup: Suppression workflow FTP, SSH stable"
git push origin main
```

---

**Pour l'instant, gardons les deux pour plus de sécurité ! 🛡️**