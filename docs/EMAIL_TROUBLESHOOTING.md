# Guide de dépannage - Envoi d'emails

## Problème résolu : Timeout lors de l'envoi d'emails

### Symptômes
- Les logs s'arrêtent après "Préparation de l'email"
- L'application tourne en boucle sans message d'erreur
- Les emails ne sont jamais envoyés

### Cause racine
Le service `MailerService` n'avait pas de:
1. **Gestion d'erreur** (try/catch)
2. **Timeouts configurés** pour nodemailer
3. **Logging détaillé** des erreurs

Lorsque l'envoi d'email échouait (credentials invalides, problème réseau, etc.), l'application bloquait indéfiniment sans log d'erreur.

### Corrections apportées

#### 1. MailerService.ts
- ✅ Ajout d'un **try/catch complet** autour de l'envoi
- ✅ Configuration des **timeouts SMTP** :
  - `connectionTimeout: 10000` (10 secondes)
  - `greetingTimeout: 5000` (5 secondes)
  - `socketTimeout: 30000` (30 secondes)
- ✅ Ajout d'un **timeout global de 60 secondes** avec `Promise.race()`
- ✅ **Logging détaillé** des erreurs avec stack trace

#### 2. VehiculesService.ts
- ✅ Ajout d'un **try/catch** dans `sendVerificationMail()`
- ✅ **Logging avant et après** l'appel au MailerService
- ✅ Messages d'erreur plus explicites

## Configuration en production

### Variables d'environnement requises

Sur **Railway**, vérifier que ces variables sont définies:

```bash
GMAIL_USER=votre_email@gmail.com
GMAIL_APP_PASSWORD=votre_mot_de_passe_application
```

### Générer un mot de passe d'application Gmail

1. Aller sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Activer la **validation en deux étapes**
3. Rechercher "Mots de passe d'application"
4. Générer un nouveau mot de passe pour "Mail" / "Autre"
5. Copier le mot de passe (16 caractères sans espaces)
6. Le définir dans Railway comme `GMAIL_APP_PASSWORD`

### Vérifier les logs en production

Après le déploiement, les nouveaux logs afficheront:

```
ℹ️ INFO [VehiculesService] Préparation de l'email
ℹ️ INFO [MailerService] Tentative d'envoi email...
✅ INFO [MailerService] Email envoyé avec succès
```

En cas d'erreur, vous verrez maintenant:

```
❌ ERROR [MailerService] Erreur lors de l'envoi de l'email
  └─ Data: {
    "error": "Invalid login: 535-5.7.8 Username and Password not accepted",
    "to": "destinataire@example.com",
    "subject": "Rapport de vérification - VSAV"
  }
```

## Tests recommandés

### Test 1: Vérifier la configuration Gmail
```bash
# Dans Railway, tester la connexion SMTP
curl -X GET https://votre-app.railway.app/api/health/email
```

### Test 2: Envoyer un email de test
```bash
# Soumettre une vérification de véhicule
curl -X POST https://votre-app.railway.app/api/vehicules/1/validate \
  -H "Content-Type: application/json" \
  -H "Cookie: token=..." \
  -d '{"1": {"elementId": 1, "status": "OK", "comment": "Test"}}'
```

### Test 3: Vérifier les logs Railway
```bash
# Dans le dashboard Railway:
# Project > Deployments > View logs
# Rechercher "MailerService" pour voir les tentatives d'envoi
```

## Scénarios d'erreur gérés

| Erreur | Log | Solution |
|--------|-----|----------|
| Credentials invalides | `Invalid login: 535-5.7.8` | Régénérer le mot de passe d'application Gmail |
| Timeout de connexion | `Timeout: L'envoi d'email a pris trop de temps` | Vérifier la connexion réseau de Railway |
| Responsable manquant | `Aucun responsable de garde trouvé` | Assigner un responsable à la garde |
| Variables manquantes | `Configuration Gmail incomplète` | Définir `GMAIL_USER` et `GMAIL_APP_PASSWORD` |

## Rollback si nécessaire

Si les modifications causent des problèmes, revenir au commit précédent:

```bash
git revert HEAD
git push origin main
```

Puis configurer un service d'email externe (SendGrid, Mailgun, etc.) avec plus de fiabilité.

## Améliorations futures

- [ ] Ajouter une retry policy (3 tentatives max)
- [ ] Utiliser un service d'email dédié (SendGrid, AWS SES)
- [ ] Mettre en place une queue d'envoi (Bull/BullMQ)
- [ ] Stocker les échecs d'envoi en base de données
- [ ] Créer une page d'administration pour renvoyer les emails échoués
