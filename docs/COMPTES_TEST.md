# Comptes de test - GardeReady

## Authentification (local ou Microsoft)

GardeReady supporte deux modes de connexion, un seul actif à la fois selon la variable
`AUTH_PROVIDER` (`Sources/api/.env.local` ou variables d'environnement de production) — voir
`docs/AZURE_AD_SETUP.md` pour le détail complet et comment basculer entre les deux.

### Mode local (`AUTH_PROVIDER=local`, par défaut)

Connexion classique email/mot de passe, comptes seedés dans
`Sources/database/initdb/init.sql` :

- `admin@gardeready.com` / `AdminReady2024!` — superAdmin
- `user@sdis49.fr` / `User123!` — user, Garde 1
- `john.doe@sdis49.fr` / `User123!` — user, Garde 2
- `jane.smith@sdis49.fr` / `User123!` — user, Garde 3
- `antoine.huet@sdis49.fr` / `Antoine1` — admin, Garde 2

Tous les mots de passe sont cryptés avec bcrypt (saltRounds = 12). Seuls les emails du domaine
`@sdis49.fr` sont acceptés à la création d'un nouvel utilisateur depuis le panel admin (le compte
`admin@gardeready.com` est une exception seedée directement en base).

### Mode Microsoft (`AUTH_PROVIDER=microsoft`)

Connexion via Microsoft Entra ID (OAuth2/OIDC) — voir `docs/AZURE_AD_SETUP.md` pour la
configuration du tenant (SDIS en production, tenant personnel pour du dev/test).

Ces mêmes comptes seedés existent toujours en base pour préserver garde/rôle assignés. Pour
qu'un de ces comptes se connecte via Microsoft, il faut qu'un compte Microsoft existe avec le
**même email**, ou laisser le premier login Microsoft avec cet email créer/lier automatiquement
le compte :

- `admin@gardeready.com` — superAdmin
- `user@sdis49.fr` — user, Garde 1
- `john.doe@sdis49.fr` — user, Garde 2
- `jane.smith@sdis49.fr` — user, Garde 3
- `antoine.huet@sdis49.fr` — admin, Garde 2

## Nouveaux comptes (mode Microsoft)

- Un email qui se connecte via Microsoft et qui correspond à un `Users` existant (par email) est
  automatiquement lié à son identité Microsoft (`azure_oid`) au premier login.
- Un email qui se connecte via Microsoft sans correspondance dans `Users` déclenche la
  **création automatique** d'un compte (`role: "user"`, sans garde assignée) — il apparaît
  ensuite dans la carte "utilisateurs non assignés" du panel admin pour qu'un admin lui
  attribue une garde et ajuste son rôle si besoin.
- Un admin peut aussi pré-créer un compte (email/nom/rôle/garde) depuis le panel admin *avant*
  la première connexion de la personne — le compte sera alors lié par email dès son premier
  login Microsoft, sans passer par la création automatique.
