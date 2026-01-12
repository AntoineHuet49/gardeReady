# Système de Logging - GardeReady

## Vue d'ensemble

Le projet GardeReady utilise un système de logging personnalisé avec des classes `Logger` côté backend (Node.js/TypeScript) et frontend (React/TypeScript).

## Caractéristiques

✅ **Niveaux de log configurables** (DEBUG, INFO, WARN, ERROR)  
✅ **Contexte automatique** (nom du module/composant)  
✅ **Emojis colorés** pour une lecture rapide  
✅ **Timestamps** pour tracer l'ordre des événements  
✅ **Formatage intelligent** des objets et erreurs  
✅ **Gestion des erreurs Sequelize** (backend) et Axios (frontend)  
✅ **Configuration via variables d'environnement**

## Installation

Le système est déjà intégré. Aucune dépendance externe requise.

### Backend
```typescript
import { createLogger } from '~~/Utils/Logger';

const logger = createLogger('MonModule');
```

### Frontend
```typescript
import { createLogger } from '../App/utils/Logger';

const logger = createLogger('MonComposant');
```

## Utilisation

### Méthodes disponibles

```typescript
// Debug - Informations détaillées de développement
logger.debug("Message de debug", { data: "optionnel" });

// Info - Informations générales
logger.info("Opération réussie", { result: data });

// Warning - Avertissements
logger.warn("Attention", { issue: "quelque chose" });

// Error - Erreurs
logger.error("Erreur fatale", error);

// Success - Succès (alias de info avec emoji ✅)
logger.success("Opération réussie", { id: 123 });

// Données reçues
logger.received("Données reçues du client", requestBody);

// Données envoyées
logger.sent("Données envoyées au serveur", payload);

// Base de données (backend uniquement)
logger.database("Requête exécutée", { sql: "SELECT..." });

// HTTP
logger.http("Requête HTTP reçue", { method: "POST", url: "/api/sections" });
```

### Méthodes spéciales

#### Backend - Erreur Sequelize
```typescript
try {
    await Sections.create(data);
} catch (error) {
    logger.sequelizeError("Erreur lors de la création", error);
    // Affiche automatiquement: SQL, paramètres, contraintes violées, etc.
}
```

#### Backend - Requête HTTP détaillée
```typescript
logger.httpRequest({
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers
});
// Affiche: méthode, URL, headers importants, body formaté
```

#### Frontend - Erreur Axios
```typescript
try {
    await axios.post('/api/sections', data);
} catch (error) {
    logger.axiosError("Erreur lors de la requête", error);
    // Affiche automatiquement: status, response data, config, etc.
}
```

## Configuration des niveaux de log

### Backend (.env ou .env.local)
```bash
# DEBUG: Tout afficher (développement)
LOG_LEVEL=DEBUG

# INFO: Infos générales + warnings + erreurs (production)
LOG_LEVEL=INFO

# WARN: Seulement warnings + erreurs
LOG_LEVEL=WARN

# ERROR: Seulement les erreurs
LOG_LEVEL=ERROR
```

**Par défaut:**
- Développement (NODE_ENV !== production): `DEBUG`
- Production: `INFO`

### Frontend (.env ou .env.local)
```bash
# DEBUG: Tout afficher (développement)
VITE_LOG_LEVEL=DEBUG

# INFO: Infos générales + warnings + erreurs (production)
VITE_LOG_LEVEL=INFO

# WARN: Seulement warnings + erreurs
VITE_LOG_LEVEL=WARN

# ERROR: Seulement les erreurs
VITE_LOG_LEVEL=ERROR

# NONE: Désactiver tous les logs
VITE_LOG_LEVEL=NONE
```

**Par défaut:**
- Développement (import.meta.env.DEV): `DEBUG`
- Production: `INFO`

## Exemples de sortie

### Debug
```
🔵 14:32:45.123 DEBUG    [SectionsController] Début création de section
  └─ Data: {"name": "Sac de secours", "vehicule_id": 1}
```

### Info
```
ℹ️ 14:32:45.234 INFO     [Application] Server listening on port 3000
```

### Warning
```
⚠️ 14:32:45.456 WARN     [SectionsController] Validation échouée: nom manquant
```

### Error
```
❌ 14:32:45.789 ERROR    [SectionsRepository] Erreur lors de la création
  └─ Type: SequelizeForeignKeyConstraintError
  └─ Message: insert or update on table "sections" violates foreign key constraint
  └─ Stack:
     at Query.formatError (/app/node_modules/sequelize/lib/dialects/postgres/query.js:366)
     ...
```

### Success
```
✅ 14:32:46.012 SUCCESS  [SectionsController] Section créée avec succès
  └─ Data: {"id": 42, "name": "Sac de secours", "vehicule_id": 1}
```

### HTTP Request (détaillé)
```
🌐 14:32:45.123 HTTP REQ [SectionsController] POST /api/sections
  ├─ Headers: {"content-type": "application/json", "origin": "http://localhost:5173"}
  └─ Body: {"name": "Sac de secours", "vehicule_id": 1}
```

## Bonnes pratiques

### 1. Créer un logger par module/composant
```typescript
// ❌ Mauvais
const logger = createLogger('App');

// ✅ Bon
const logger = createLogger('SectionsController');
const logger = createLogger('AddSectionModal');
```

### 2. Utiliser le bon niveau
```typescript
// Debug: Informations de développement
logger.debug("Données extraites du formulaire", formData);

// Info: Informations importantes
logger.info("Utilisateur connecté", { userId: user.id });

// Warn: Situations anormales mais gérées
logger.warn("Token expiré, refresh en cours");

// Error: Erreurs fatales
logger.error("Impossible de se connecter à la DB", error);
```

### 3. Éviter les logs sensibles en production
```typescript
// ❌ Ne jamais logger de mots de passe
logger.debug("Données de connexion", { email, password }); // MAUVAIS!

// ✅ Logger sans données sensibles
logger.debug("Tentative de connexion", { email }); // BON
```

### 4. Logger au bon moment
```typescript
export class SectionsController {
    private static logger = createLogger('SectionsController');

    public static async createSection(req: Request, res: Response) {
        const logger = SectionsController.logger;
        
        // 1. Début de l'opération
        logger.debug("Début création de section");
        
        // 2. Données reçues
        logger.received("Données du client", req.body);
        
        // 3. Validation
        if (!name) {
            logger.warn("Validation échouée: nom manquant");
            return res.status(400).json({ error: "..." });
        }
        
        // 4. Avant appel externe/DB
        logger.sent("Données envoyées au repository", data);
        
        try {
            const result = await SectionsRepository.createSection(data);
            
            // 5. Succès
            logger.success("Section créée", { id: result.id });
            
            return res.status(201).json(result);
        } catch (error) {
            // 6. Erreur
            logger.sequelizeError("Erreur lors de la création", error);
            return res.status(500).json({ error: "..." });
        }
    }
}
```

## Migration depuis console.log

Pour migrer un fichier existant:

```typescript
// Avant
console.log("🔵 [Module] Message", data);
console.error("❌ [Module] Erreur", error);

// Après
const logger = createLogger('Module');
logger.debug("Message", data);
logger.error("Erreur", error);
```

## Extension future

Pour ajouter Winston (logs persistants, rotation, etc.):

```bash
npm install winston
```

Puis modifier `Utils/Logger.ts` pour utiliser Winston en production et la console en développement.

## Troubleshooting

### Les logs ne s'affichent pas
1. Vérifier la variable `LOG_LEVEL` / `VITE_LOG_LEVEL`
2. Vérifier que le niveau du log est >= au niveau configuré
3. En production, utiliser `INFO` ou `DEBUG` temporairement

### Trop de logs en production
1. Configurer `LOG_LEVEL=WARN` ou `LOG_LEVEL=ERROR`
2. Supprimer les `logger.debug()` non nécessaires

### Format illisible
Les emojis peuvent ne pas s'afficher correctement dans certains terminaux.
Pour désactiver les emojis, modifier la classe Logger.

## Fichiers du système

**Backend:**
- `/Sources/api/Utils/Logger.ts` - Classe Logger
- `/Sources/api/Controllers/SectionsController.ts` - Exemple d'utilisation
- `/Sources/api/Repositories/SectionsRepository.ts` - Exemple d'utilisation
- `/Sources/api/app.ts` - Initialisation

**Frontend:**
- `/Sources/client/src/App/utils/Logger.ts` - Classe Logger
- `/Sources/client/src/App/utils/Api/Sections.ts` - Exemple d'utilisation
- `/Sources/client/src/Components/Modal/AddSectionModal.tsx` - Exemple d'utilisation
- `/Sources/client/src/main.tsx` - Initialisation
