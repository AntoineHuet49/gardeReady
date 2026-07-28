# Configuration OAuth2 Microsoft Entra ID (Azure AD) — Issue #5

GardeReady peut utiliser Microsoft Entra ID (anciennement Azure AD) comme fournisseur
d'authentification (OAuth2 / OpenID Connect, Authorization Code Flow), afin que les agents du
SDIS 49 se connectent avec leur compte Microsoft professionnel.

## Basculer entre login local et Microsoft (`AUTH_PROVIDER`)

Un seul mode d'authentification est actif à la fois, piloté par la variable d'environnement
`AUTH_PROVIDER` (`Sources/api/.env.local` ou variables d'environnement de production) :

- `AUTH_PROVIDER=local` (par défaut) : login classique email/mot de passe. C'est le mode à
  utiliser tant que le SDIS n'a pas autorisé l'App Registration ci-dessous.
- `AUTH_PROVIDER=microsoft` : login exclusivement via Microsoft Entra ID.

Changer cette variable puis **redémarrer l'API** suffit — aucun autre changement de code n'est
nécessaire, le frontend s'adapte automatiquement (formulaire classique ou bouton "Se connecter
avec Microsoft") via `GET /api/auth/provider`.

## Ce qu'il faut demander au service informatique du SDIS

Le tenant Entra ID (l'annuaire des comptes SDIS) appartient au SDIS — l'application doit y être
inscrite par leur administrateur informatique (impossible de le faire soi-même depuis un compte
externe). Demander :

1. **Créer une "App Registration"** dans leur tenant Entra ID (portail Azure > Microsoft Entra ID
   > App registrations > New registration), nommée par exemple `GardeReady`.
2. **Type de compte pris en charge** : "Accounts in this organizational directory only"
   (single-tenant) — seuls les comptes du SDIS doivent pouvoir se connecter.
3. **Redirect URI** (type "Web") à whitelister :
   - Production : `https://<domaine-de-prod>/api/auth/microsoft/callback`
   - Dev/staging si applicable : ajouter l'URL correspondante
4. Récupérer, une fois l'App Registration créée :
   - **Application (client) ID** → `AZURE_AD_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_AD_TENANT_ID`
   - Un **Client secret** (Certificates & secrets > New client secret) → `AZURE_AD_CLIENT_SECRET`
     (noter la date d'expiration choisie — à renouveler avant qu'il n'expire)
5. **API permissions** : ajouter les permissions déléguées Microsoft Graph `openid`, `profile`,
   `email`, `User.Read` (permissions de base, généralement déjà présentes par défaut).
6. **Consentement admin** : cliquer sur "Grant admin consent for <tenant SDIS>" afin que tous les
   agents puissent se connecter sans popup de consentement individuel au premier login.

## Configuration côté GardeReady

Renseigner dans `Sources/api/.env.local` (dev) ou les variables d'environnement de production
(Railway) :

```
AZURE_AD_CLIENT_ID=...
AZURE_AD_TENANT_ID=...
AZURE_AD_CLIENT_SECRET=...
AZURE_AD_REDIRECT_URI=https://<domaine>/api/auth/microsoft/callback
```

Aucun changement de code n'est nécessaire pour passer d'un tenant de test à celui du SDIS —
uniquement ces 4 variables.

## Développement / test sans attendre le SDIS

En attendant que le service informatique du SDIS crée l'App Registration, créez un tenant
Microsoft Entra ID personnel et gratuit pour développer et tester le flow de bout en bout :

1. [Microsoft 365 Developer Program](https://developer.microsoft.com/microsoft-365/dev-program)
   (gratuit, renouvelable, fournit un tenant + des comptes de test), ou directement le
   [portail Azure](https://portal.azure.com) avec un compte Microsoft personnel.
2. Suivre les mêmes étapes que ci-dessus (App Registration, Redirect URI
   `http://localhost:3000/api/auth/microsoft/callback`, client secret, permissions, consentement
   admin) dans ce tenant personnel.
3. Renseigner les variables d'environnement dans `Sources/api/.env.local` avec ces valeurs de test.

## Comportement applicatif

- Au clic sur "Se connecter avec Microsoft", le backend redirige vers Microsoft
  (`GET /api/auth/microsoft/login`), puis Microsoft redirige vers
  `GET /api/auth/microsoft/callback?code=...`.
- Le backend échange le code contre les informations du compte Microsoft (email, identifiant
  Azure AD `oid`), cherche un `Users` existant par `azure_oid` puis par email :
  - trouvé → compte lié (si ce n'était pas déjà fait) et connecté ;
  - non trouvé → un nouveau compte `Users` est créé automatiquement (`role: "user"`, sans garde
    assignée) ; un admin doit ensuite lui attribuer une garde/un rôle depuis le panel admin.
- Le backend émet ensuite le même JWT applicatif qu'auparavant (cookie `token`) — le reste de
  l'application (middleware, contextes, routes privées) est inchangé.
