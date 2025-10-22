# Comptes de test - GardeReady

## Administrateur
- **Email :** `admin@sdis49.fr`
- **Mot de passe :** `Admin123!`
- **Rôle :** Admin
- **Garde :** Garde 1

## Utilisateur standard
- **Email :** `user@sdis49.fr`
- **Mot de passe :** `User123!`
- **Rôle :** User
- **Garde :** Garde 1

## Autres utilisateurs de test
- **Email :** `john.doe@sdis49.fr` | **MDP :** `User123!` | **Garde :** 2
- **Email :** `jane.smith@sdis49.fr` | **MDP :** `User123!` | **Garde :** 3

---

## Notes importantes :
- Tous les mots de passe sont cryptés avec bcrypt (saltRounds = 12)
- Seuls les emails du domaine `@sdis49.fr` sont acceptés
- Le compte admin peut accéder à toutes les fonctionnalités
- Les utilisateurs standards ont un accès limité

## Pour tester la création d'utilisateur :
Utilisez l'interface admin avec le compte `admin@sdis49.fr` pour créer de nouveaux utilisateurs.