# Scripts de base de données

Ce dossier contient les scripts SQL pour initialiser la base de données PostgreSQL.

## Scripts disponibles

### `init.sql`
Script complet avec données de test et exemples d'utilisateurs. Idéal pour le développement local.

### `init-deployment.sql` ⭐ **Recommandé pour le déploiement**
Script optimisé pour la production avec :
- Structure complète des tables
- Un seul compte administrateur
- Aucune donnée de test

## Compte administrateur par défaut

**Email** : `admin@gardeready.com`  
**Mot de passe** : `AdminReady2024!`  
**Rôle** : `admin`

⚠️ **Important** : Changez ce mot de passe après le premier déploiement !

## Générer un nouveau mot de passe admin

```bash
# Depuis le dossier database
node generate-password-hash.js "VotreNouveauMotDePasse"
```

Le script affichera le hash bcrypt à utiliser dans le SQL.

## Structure des tables

- **`users`** - Utilisateurs du système
- **`gardes`** - Équipes/groupes d'utilisateurs  
- **`vehicules`** - Véhicules d'intervention
- **`sections`** - Sections hiérarchiques des véhicules
- **`elements`** - Éléments à vérifier dans chaque section

## Utilisation avec Railway

1. Railway détecte automatiquement les scripts dans `initdb/`
2. Pour le déploiement, renommez `init-deployment.sql` en `init.sql`
3. Ou gardez `init.sql` pour les données de test

## Relations entre les tables

```
users ←→ gardes (many-to-one avec responsable)
vehicules → sections (one-to-many)
sections → sections (hiérarchique, parent-enfant)  
sections → elements (one-to-many)
```