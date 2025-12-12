---
applyTo: "Sources/api/**/*"
---

# Instructions API Backend - GardeReady

**Chemin**: `Sources/api/**`

## Architecture de l'API

L'API suit une architecture en couches (Clean Architecture) pour garantir la maintenabilité et la testabilité :

```
app.ts (point d'entrée)
    ↓
routes/routes.ts (routage)
    ↓
Controllers (gestion HTTP)
    ↓
Services (logique métier)
    ↓
Repositories (accès données)
    ↓
Models (Sequelize ORM)
```

## Structure des dossiers

```
Sources/api/
├── app.ts                  # Point d'entrée de l'application
├── Controllers/            # Gestion des requêtes/réponses HTTP
├── Services/              # Logique métier
├── Repositories/          # Accès aux données (couche d'abstraction)
├── Models/                # Modèles Sequelize et associations
├── routes/                # Définition des routes Express
├── Types/                 # Définitions TypeScript (DTOs, interfaces)
├── Helpers/               # Utilitaires (codes HTTP, résultats)
├── Utils/                 # Configuration (Database)
└── public/                # Frontend buildé (en production)
```

## Modèles de données (Sequelize)

### Users.ts
```typescript
// Champs principaux
- id: SERIAL PRIMARY KEY
- email: VARCHAR(100) UNIQUE
- password: VARCHAR(255) (hashé avec bcrypt)
- firstname, lastname: VARCHAR(50)
- role: 'admin' | 'user'
- garde_id: Foreign Key vers Gardes
```

### Gardes.ts
```typescript
// Champs principaux
- id: SERIAL PRIMARY KEY
- name: VARCHAR(50) UNIQUE
- color: VARCHAR(50)
- responsable: Foreign Key vers Users
```

### Vehicules.ts
```typescript
// Champs principaux
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100)
```

### Sections.ts
```typescript
// Structure hiérarchique auto-référentielle
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100)
- vehicule_id: Foreign Key vers Vehicules (sections racines uniquement)
- parent_section_id: Foreign Key auto-référentielle (sous-sections uniquement)

// Contrainte: Une section est soit racine (vehicule_id) soit sous-section (parent_section_id)
```

### Elements.ts
```typescript
// Champs principaux
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100)
- section_id: Foreign Key vers Sections
```

## Associations Sequelize

**Fichier important**: `Models/setupAssociations.ts`

```typescript
// Relations définies:
Vehicules.hasMany(Sections) // Sections racines
Sections.hasMany(Sections)  // Hiérarchie parent-enfant
Sections.hasMany(Elements)  // Éléments dans une section
Users.belongsTo(Gardes)
Gardes.belongsTo(Users)     // Responsable
```

**⚠️ IMPORTANT**: Toujours appeler `setupAssociations()` après la définition des modèles.

## Conventions des Controllers

### Structure type d'un Controller

```typescript
import asyncHandler from "express-async-handler";
import { BaseController } from "./BaseController";
import { MonService } from "../Services/MonService";

export class MonController extends BaseController {
    
    // GET - Liste
    static getAll = asyncHandler(async (req, res) => {
        const result = await MonService.getAll();
        
        if (result.success) {
            return res.status(HttpCode.OK).json(result.data);
        }
        return res.status(HttpCode.INTERNAL_SERVER_ERROR).json(result.error);
    });

    // POST - Création
    static create = asyncHandler(async (req, res) => {
        const dto = req.body as CreateMonDto;
        const result = await MonService.create(dto);
        
        if (result.success) {
            return res.status(HttpCode.CREATED).json(result.data);
        }
        return res.status(HttpCode.BAD_REQUEST).json(result.error);
    });

    // DELETE - Suppression
    static delete = asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id);
        const result = await MonService.delete(id);
        
        if (result.success) {
            return res.status(HttpCode.OK).json(result.data);
        }
        return res.status(HttpCode.NOT_FOUND).json(result.error);
    });
}
```

### Codes HTTP (Helpers/HttpCode.ts)

```typescript
HttpCode.OK = 200           // Succès GET
HttpCode.CREATED = 201      // Succès POST
HttpCode.BAD_REQUEST = 400  // Erreur validation
HttpCode.UNAUTHORIZED = 401 // Non authentifié
HttpCode.FORBIDDEN = 403    // Pas les droits
HttpCode.NOT_FOUND = 404    // Ressource inexistante
HttpCode.INTERNAL_SERVER_ERROR = 500 // Erreur serveur
```

## Conventions des Services

### Structure type d'un Service

```typescript
import { OperationResult } from "../Helpers/OperationResult";
import { MonRepository } from "../Repositories/MonRepository";

export class MonService {
    
    static async getAll(): Promise<OperationResult> {
        try {
            const data = await MonRepository.findAll();
            return OperationResult.success(data);
        } catch (error) {
            console.error("Erreur getAll:", error);
            return OperationResult.failure("Erreur lors de la récupération");
        }
    }

    static async create(dto: CreateMonDto): Promise<OperationResult> {
        try {
            // Validation métier
            if (!dto.name || dto.name.trim() === "") {
                return OperationResult.failure("Le nom est requis");
            }

            const data = await MonRepository.create(dto);
            return OperationResult.success(data);
        } catch (error) {
            console.error("Erreur create:", error);
            return OperationResult.failure("Erreur lors de la création");
        }
    }
}
```

### OperationResult Pattern

Toujours utiliser `OperationResult` pour standardiser les retours:

```typescript
// Succès
return OperationResult.success(data);

// Échec
return OperationResult.failure("Message d'erreur");

// Vérification dans le controller
if (result.success) {
    res.json(result.data);
} else {
    res.json(result.error);
}
```

## Conventions des Repositories

### Structure type d'un Repository

```typescript
import { MonModel } from "../Models/MonModel";

export class MonRepository {
    
    // Récupérer tous avec relations
    static async findAll() {
        return await MonModel.findAll({
            include: [
                { association: "relationName", attributes: ["id", "name"] }
            ],
            order: [["name", "ASC"]]
        });
    }

    // Récupérer un par ID
    static async findById(id: number) {
        return await MonModel.findByPk(id, {
            include: ["relationName"]
        });
    }

    // Créer
    static async create(data: any) {
        return await MonModel.create(data);
    }

    // Mettre à jour
    static async update(id: number, data: any) {
        const item = await this.findById(id);
        if (!item) return null;
        return await item.update(data);
    }

    // Supprimer
    static async delete(id: number) {
        const item = await this.findById(id);
        if (!item) return false;
        await item.destroy();
        return true;
    }
}
```

## Authentification et sécurité

### JWT Token

- **Génération**: `AuthService.login()` crée un token JWT
- **Stockage**: Cookie httpOnly, secure en production
- **Validation**: Middleware sur les routes protégées
- **Secret**: Variable `JWT_SECRET` dans `.env`

### Hashage des mots de passe

```typescript
import bcrypt from "bcrypt";

// Créer un hash (inscription)
const hashedPassword = await bcrypt.hash(password, 12);

// Vérifier (connexion)
const isValid = await bcrypt.compare(password, hashedPassword);
```

### CORS Configuration

**Fichier**: `app.ts`

```typescript
const allowedOrigins = [
    "http://localhost:5173",  // Dev local
    process.env.FRONTEND_URL  // Production
];
```

Toujours mettre à jour les origins autorisées selon l'environnement.

## Routes API

**Fichier**: `routes/routes.ts`

Convention de nommage:
```
/api/auth/*          # Authentification
/api/users/*         # Gestion des utilisateurs
/api/gardes/*        # Gestion des gardes
/api/vehicules/*     # Gestion des véhicules
/api/sections/*      # Gestion des sections
/api/elements/*      # Gestion des éléments
```

## DTOs (Data Transfer Objects)

**Dossier**: `Types/DTO/`

Toujours créer un DTO pour:
- Validation des entrées utilisateur
- Typage strict des requêtes
- Documentation implicite de l'API

Exemple:
```typescript
export interface CreateUserDto {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    role: "admin" | "user";
    garde_id?: number;
}
```

## Gestion des erreurs

### Pattern try/catch obligatoire

```typescript
static async maMethode(): Promise<OperationResult> {
    try {
        // Logique métier
        const result = await MonRepository.action();
        return OperationResult.success(result);
    } catch (error) {
        // Log détaillé pour le debug
        console.error("Erreur maMethode:", error);
        
        // Message générique pour l'utilisateur
        return OperationResult.failure("Erreur lors de l'opération");
    }
}
```

### Middleware asyncHandler

Utiliser `express-async-handler` dans tous les controllers pour capturer automatiquement les erreurs async.

## Base de données

### Connexion

**Fichier**: `Utils/Database.ts`

```typescript
export async function connectDatabase() {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false }); // Pas de alter en prod!
    setupAssociations(); // Important!
}
```

### Variables d'environnement requises

```
DATABASE_URL=postgresql://user:password@host:port/database
```

## Build et déploiement

### Scripts npm

```json
{
  "dev": "npx nodemon ./app.ts",           // Développement avec hot-reload
  "build": "npx tsup app.ts",              // Build pour production
  "start": "node dist/app.js",             // Démarrer en production
  "start:prod": "node app.js"              // Alternative production
}
```

### Dépendances importantes

- `express`: Framework web
- `sequelize`: ORM PostgreSQL
- `pg`: Driver PostgreSQL
- `jsonwebtoken`: Authentification JWT
- `bcrypt`: Hashage mots de passe
- `cors`: Cross-Origin Resource Sharing
- `dotenv`: Variables d'environnement
- `node-mailjet`: Envoi d'emails
- `express-async-handler`: Gestion erreurs async

## Bonnes pratiques spécifiques

1. **Toujours** utiliser `asyncHandler` dans les controllers
2. **Toujours** retourner `OperationResult` depuis les services
3. **Toujours** logger les erreurs avec `console.error`
4. **Toujours** valider les DTOs avant traitement
5. **Jamais** exposer les mots de passe ou secrets dans les réponses
6. **Jamais** utiliser `sync({ force: true })` en production
7. **Préférer** les repositories pour l'accès aux données plutôt que les modèles directs
8. **Utiliser** les associations Sequelize pour les jointures
9. **Tester** toutes les routes avec des données réelles avant commit
10. **Documenter** les endpoints complexes avec des commentaires

## Tests et debugging

### Vérifier la connexion DB
```typescript
// Dans app.ts, vérifier les logs
connectDatabase().then(() => {
    console.log("✅ Database connected");
}).catch(error => {
    console.error("❌ Database connection failed:", error);
});
```

### Logs CORS
Les logs CORS s'affichent automatiquement pour chaque requête (voir app.ts).

### Tester avec curl
```bash
# Test GET
curl http://localhost:3000/api/vehicules

# Test POST
curl -X POST http://localhost:3000/api/vehicules \
  -H "Content-Type: application/json" \
  -d '{"name": "Nouveau véhicule"}'
```
