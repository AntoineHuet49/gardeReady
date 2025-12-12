---
applyTo: "**/*"
---

# GardeReady - Documentation Générale

## Vue d'ensemble du projet

GardeReady est une application web fullstack de gestion des gardes et vérifications de véhicules pour le SDIS 49 (Service Départemental d'Incendie et de Secours du Maine-et-Loire). L'application permet aux équipes de pompiers de gérer les équipes de garde et de vérifier l'état des équipements dans les véhicules d'intervention.

## Architecture du projet

Le projet suit une architecture **client-serveur** avec trois composants principaux :

```
gardeReady/
├── Sources/
│   ├── api/          # Backend Node.js/Express/TypeScript
│   ├── client/       # Frontend React/TypeScript/Vite
│   └── database/     # Scripts et initialisation PostgreSQL
├── Script/
│   └── database/     # Scripts de déploiement
├── docker-compose.yml
└── .github/
    └── instructions/ # Documentation pour GitHub Copilot
```

### Stack technique

**Backend (API):**
- Node.js avec Express 5.x
- TypeScript pour le typage statique
- Sequelize ORM pour PostgreSQL
- JWT pour l'authentification
- Bcrypt pour le hashage des mots de passe
- Mailjet pour l'envoi d'emails
- jsPDF pour la génération de rapports PDF

**Frontend (Client):**
- React 18 avec TypeScript
- Vite comme build tool
- React Router pour la navigation
- TanStack Query (React Query) pour la gestion des données
- Tailwind CSS + DaisyUI pour le styling
- React Hook Form pour les formulaires
- React Toastify pour les notifications

**Base de données:**
- PostgreSQL avec structure relationnelle
- Utilisation de Docker pour le développement local

## Modèle de données

### Entités principales

1. **Users** (Utilisateurs)
   - Gestion des pompiers avec authentification
   - Rôles: `admin` ou `user`
   - Association à une garde

2. **Gardes** (Équipes)
   - Groupes de travail identifiés par nom et couleur
   - Chaque garde a un responsable (utilisateur)

3. **Vehicules** (Véhicules d'intervention)
   - Types: VSAV, Camion de pompier, Voiture, etc.
   - Contient des sections racines

4. **Sections** (Structure hiérarchique)
   - Organisation arborescente des compartiments
   - Peut être une section racine (liée à un véhicule) ou sous-section (liée à une section parente)
   - Exemple: VSAV > Sac prompt secours > Poche bleue

5. **Elements** (Équipements)
   - Matériels et équipements à vérifier
   - Attachés à une section spécifique

### Relations clés

- Un véhicule contient plusieurs sections racines
- Les sections forment une hiérarchie (parent/enfant)
- Chaque section contient des éléments à vérifier
- Les utilisateurs sont assignés à des gardes
- Chaque garde a un responsable

## Flux d'authentification

1. L'utilisateur se connecte via email/mot de passe
2. Le backend génère un JWT token
3. Le token est stocké dans un cookie sécurisé
4. Les requêtes API incluent ce cookie pour l'authentification
5. Middleware de vérification sur les routes protégées

## Environnement de développement

### Ports utilisés
- Frontend: `5173` (Vite dev server)
- Backend: `3000` (Express API)
- Database: `5432` (PostgreSQL)

### Variables d'environnement requises

**Backend (.env):**
```
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=http://localhost:5173
MAILJET_API_KEY=votre_api_key
MAILJET_API_SECRET=votre_api_secret
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000
```

## Principes de développement

### Conventions de code

1. **TypeScript strict**: Toujours typer les fonctions et variables
2. **Nommage**:
   - PascalCase pour les composants React et classes
   - camelCase pour les fonctions et variables
   - UPPER_SNAKE_CASE pour les constantes
3. **Structure des fichiers**:
   - Un composant par fichier
   - Co-localisation des types avec leur utilisation
   - Séparation Controllers/Services/Repositories côté backend

### Architecture backend (Clean Architecture)

```
Controllers → Services → Repositories → Models
```

- **Controllers**: Gestion des requêtes HTTP et réponses
- **Services**: Logique métier et orchestration
- **Repositories**: Accès aux données (abstraction Sequelize)
- **Models**: Définition des schémas Sequelize

### Architecture frontend

```
Pages → Components → Hooks → API
```

- **Pages**: Vues principales de l'application
- **Components**: Composants réutilisables (Button, Modal, Card, etc.)
- **Hooks**: Logique réutilisable (useSectionMutations, useElementMutations)
- **API**: Couche d'abstraction pour les appels backend

## Déploiement

Le projet est conçu pour être déployé sur Railway avec:
- API et frontend buildé servis par Express
- Base de données PostgreSQL managée
- Variables d'environnement configurées via Railway

Le frontend buildé est servi en tant que SPA depuis `/Sources/api/public/` avec un fallback vers `index.html`.

## Comptes de test

Voir le fichier `COMPTES_TEST.md` à la racine du projet pour les identifiants de test.

## Bonnes pratiques pour les modifications

1. **Toujours** vérifier les associations Sequelize dans `setupAssociations.ts`
2. **Utiliser** les DTOs pour valider les entrées
3. **Implémenter** la gestion d'erreurs avec try/catch et codes HTTP appropriés
4. **Tester** les modifications avec Docker Compose avant le déploiement
5. **Maintenir** la cohérence entre les types TypeScript frontend/backend
