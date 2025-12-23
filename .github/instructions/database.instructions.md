---
applyTo: "Sources/database/**/*,Script/database/**/*,**/*.sql"
---

# Instructions Base de Données - GardeReady

**Chemin**: `Sources/database/**` et `Script/database/**`

## Architecture de la base de données

Base de données **PostgreSQL** avec structure relationnelle et hiérarchique pour gérer les véhicules, sections et éléments d'intervention des pompiers.

## Schéma de la base de données

### Diagramme des relations

```
Users ←→ Gardes
  ↓
  (garde_id)

Vehicules → Sections (racines) → Sections (enfants) → Elements
                 ↓                      ↓
            (vehicule_id)        (parent_section_id)
```

## Tables principales

### Table `users`

Stocke les informations des utilisateurs (pompiers).

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,        -- Hash bcrypt
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',  -- 'admin' ou 'user'
    garde_id INT,
    CONSTRAINT fk_garde FOREIGN KEY (garde_id) 
        REFERENCES gardes(id) ON DELETE CASCADE
);
```

**Index recommandés**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_garde_id ON users(garde_id);
CREATE INDEX idx_users_role ON users(role);
```

### Table `gardes`

Représente les équipes de garde.

```sql
CREATE TABLE gardes (
    id SERIAL PRIMARY KEY,
    numero INT NOT NULL UNIQUE,            -- Numéro de la garde (ex: 1, 2, 3)
    color VARCHAR(50) NOT NULL,            -- Code couleur pour l'interface
    responsable INT,                       -- Optionnel : peut être NULL
    CONSTRAINT fk_responsable FOREIGN KEY (responsable) 
        REFERENCES users(id) ON DELETE SET NULL
);
```

**Points importants**:
- Le champ `numero` remplace l'ancien champ `name` - Affichage : "Garde 1", "Garde 2", etc.
- Le responsable est **optionnel** lors de la création (contrainte circulaire avec Users)
- `ON DELETE SET NULL` : si le responsable est supprimé, la garde reste mais sans responsable
- Tri par défaut : par `numero ASC`

**Contrainte circulaire résolue**: Users ↔ Gardes
- Un utilisateur appartient à une garde (`garde_id`)
- Une garde peut avoir un responsable (`responsable`)
- **Solution** : Créer d'abord la garde sans responsable, puis créer les utilisateurs, puis assigner le responsable

**Index recommandés**:
```sql
CREATE INDEX idx_gardes_numero ON gardes(numero);
CREATE INDEX idx_gardes_responsable ON gardes(responsable);
```

### Table `vehicules`

Liste des véhicules d'intervention.

```sql
CREATE TABLE vehicules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
```

**Exemples de véhicules**:
- VSAV (Véhicule de Secours et d'Assistance aux Victimes)
- Camion de pompier
- Voiture de police

### Table `sections` (Structure hiérarchique)

Organisation arborescente des compartiments des véhicules.

```sql
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicule_id INT,                       -- NULL si sous-section
    parent_section_id INT,                 -- NULL si section racine
    CONSTRAINT fk_section_vehicule 
        FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    CONSTRAINT fk_section_parent 
        FOREIGN KEY (parent_section_id) REFERENCES sections(id) ON DELETE CASCADE,
    CONSTRAINT check_section_root CHECK (
        (vehicule_id IS NOT NULL AND parent_section_id IS NULL) OR  -- Section racine
        (vehicule_id IS NULL AND parent_section_id IS NOT NULL)     -- Sous-section
    )
);
```

**Logique importante**:
- **Section racine**: `vehicule_id` renseigné, `parent_section_id` NULL
- **Sous-section**: `parent_section_id` renseigné, `vehicule_id` NULL
- Les deux champs ne peuvent pas être renseignés ou NULL simultanément (contrainte CHECK)

**Index recommandés**:
```sql
CREATE INDEX idx_sections_vehicule_id ON sections(vehicule_id);
CREATE INDEX idx_sections_parent_section_id ON sections(parent_section_id);
```

**Exemple de hiérarchie**:
```
VSAV (vehicule)
├── Sac prompt secours (section racine)
│   ├── Poche bleue (sous-section)
│   └── Poche rouge (sous-section)
└── Extérieur (section racine)
    └── Coffre (sous-section)
```

### Table `elements`

Équipements et matériels à vérifier dans chaque section.

```sql
CREATE TABLE elements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    section_id INT,
    CONSTRAINT fk_element_section 
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);
```

**Index recommandés**:
```sql
CREATE INDEX idx_elements_section_id ON elements(section_id);
```

## Contraintes d'intégrité

### ON DELETE CASCADE

Toutes les clés étrangères utilisent `ON DELETE CASCADE` pour maintenir l'intégrité:

- Suppression d'un véhicule → supprime ses sections racines
- Suppression d'une section → supprime ses sous-sections et éléments
- Suppression d'une garde → supprime les assignations des utilisateurs
- Suppression d'un utilisateur responsable → supprime sa garde

⚠️ **Attention**: La suppression en cascade peut avoir un impact important. Toujours vérifier les dépendances avant de supprimer.

### Contraintes CHECK

```sql
-- Section: doit être soit racine, soit sous-section (pas les deux)
CONSTRAINT check_section_root CHECK (
    (vehicule_id IS NOT NULL AND parent_section_id IS NULL) OR
    (vehicule_id IS NULL AND parent_section_id IS NOT NULL)
)
```

### Contraintes UNIQUE

```sql
-- Email unique par utilisateur
email VARCHAR(100) NOT NULL UNIQUE

-- Nom de garde unique
name VARCHAR(50) NOT NULL UNIQUE
```

## Scripts d'initialisation

### Fichier `Sources/database/initdb/init.sql`

Script principal pour:
1. Créer toutes les tables
2. Ajouter les contraintes
3. Insérer les données de test

**Ordre d'exécution important**:
```sql
-- 1. Créer les tables sans contraintes circulaires
CREATE TABLE users ...
CREATE TABLE gardes ...
CREATE TABLE vehicules ...
CREATE TABLE sections ...
CREATE TABLE elements ...

-- 2. Ajouter les clés étrangères
ALTER TABLE users ADD CONSTRAINT fk_garde ...
ALTER TABLE gardes ADD CONSTRAINT fk_responsable ...

-- 3. Insérer les données en deux temps pour gérer la circularité
INSERT INTO users ... -- Sans garde_id
INSERT INTO gardes ... -- Avec responsable
UPDATE users SET garde_id = ... -- Assigner les gardes
```

### Fichier `Script/database/init-deployment.sql`

Version optimisée pour le déploiement en production (Railway, etc.).

## Données de test

### Utilisateurs de test

```sql
-- Admin
email: admin@sdis49.fr
password: Admin123! (hash: $2b$12$WDbdJ/06.C7uaRxE9cLOLO0uh80PTijl8aYDgsaiJJpHnOli9XF9K)
role: admin

-- User
email: user@sdis49.fr
password: User123! (hash: $2b$12$bgRR59xphxhr5czNCvzUGuyfCv5VbMKsk2eZI/01U63kwz3ac5jN2)
role: user
```

Voir `COMPTES_TEST.md` pour la liste complète.

### Génération de hash bcrypt

**Fichier**: `Sources/database/generate-password-hash.js`

```javascript
const bcrypt = require("bcrypt");

async function generateHash(password) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
}

generateHash("VotreMotDePasse");
```

**Utilisation**:
```bash
node Sources/database/generate-password-hash.js
```

## Requêtes SQL utiles

### Récupérer un véhicule avec ses sections et éléments

```sql
-- Sections racines d'un véhicule
SELECT s.id, s.name, s.vehicule_id
FROM sections s
WHERE s.vehicule_id = 1 AND s.parent_section_id IS NULL;

-- Sous-sections d'une section
SELECT s.id, s.name, s.parent_section_id
FROM sections s
WHERE s.parent_section_id = 1;

-- Éléments d'une section
SELECT e.id, e.name, e.section_id
FROM elements e
WHERE e.section_id = 1;
```

### Récupérer la hiérarchie complète (CTE récursif)

```sql
WITH RECURSIVE section_tree AS (
    -- Sections racines
    SELECT 
        s.id, 
        s.name, 
        s.vehicule_id, 
        s.parent_section_id,
        1 as level,
        CAST(s.name AS VARCHAR(500)) as path
    FROM sections s
    WHERE s.vehicule_id = 1 AND s.parent_section_id IS NULL
    
    UNION ALL
    
    -- Sous-sections récursives
    SELECT 
        s.id, 
        s.name, 
        s.vehicule_id, 
        s.parent_section_id,
        st.level + 1,
        CAST(st.path || ' > ' || s.name AS VARCHAR(500))
    FROM sections s
    INNER JOIN section_tree st ON s.parent_section_id = st.id
)
SELECT * FROM section_tree ORDER BY path;
```

### Statistiques des gardes

```sql
-- Nombre d'utilisateurs par garde
SELECT 
    g.name as garde,
    COUNT(u.id) as nb_users
FROM gardes g
LEFT JOIN users u ON u.garde_id = g.id
GROUP BY g.id, g.name
ORDER BY g.name;
```

### Compter les éléments par véhicule

```sql
SELECT 
    v.name as vehicule,
    COUNT(DISTINCT s.id) as nb_sections,
    COUNT(e.id) as nb_elements
FROM vehicules v
LEFT JOIN sections s ON s.vehicule_id = v.id OR s.parent_section_id IN (
    SELECT id FROM sections WHERE vehicule_id = v.id
)
LEFT JOIN elements e ON e.section_id = s.id
GROUP BY v.id, v.name
ORDER BY v.name;
```

## Configuration PostgreSQL

### Variables d'environnement

**Développement (docker-compose.yml)**:
```yaml
POSTGRES_USER: root
POSTGRES_PASSWORD: root
POSTGRES_DB: gardeready
```

**Production (Railway, Render, etc.)**:
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### Connexion depuis l'API

**Fichier**: `Sources/api/Utils/Database.ts`

```typescript
import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL!;

export const sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,  // Mettre à true pour voir les requêtes SQL
    dialectOptions: {
        ssl: process.env.NODE_ENV === "production" ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

export async function connectDatabase() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established");
        
        // ATTENTION: Ne jamais utiliser force: true en production!
        await sequelize.sync({ alter: false });
        
        setupAssociations();
    } catch (error) {
        console.error("❌ Unable to connect to database:", error);
        throw error;
    }
}
```

## Migration et synchronisation

### Sequelize sync options

```typescript
// Développement initial (crée les tables)
sequelize.sync({ force: false, alter: false })

// ⚠️ DANGER: Supprime et recrée toutes les tables
sequelize.sync({ force: true })  // NE JAMAIS utiliser en production!

// Modifie les colonnes existantes pour correspondre aux modèles
sequelize.sync({ alter: true })  // À utiliser avec précaution
```

### Migrations Sequelize (recommandé pour production)

Pour des modifications en production, utiliser Sequelize CLI:

```bash
# Installer
npm install --save-dev sequelize-cli

# Initialiser
npx sequelize-cli init

# Créer une migration
npx sequelize-cli migration:generate --name add-new-field

# Exécuter les migrations
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

## Backup et restauration

### Backup complet

```bash
# Dump de la base de données
pg_dump -h localhost -U root -d gardeready > backup.sql

# Ou avec Docker
docker exec gardeReady-database pg_dump -U root gardeready > backup.sql
```

### Restauration

```bash
# Restaurer depuis un dump
psql -h localhost -U root -d gardeready < backup.sql

# Ou avec Docker
docker exec -i gardeReady-database psql -U root gardeready < backup.sql
```

### Backup partiel (données uniquement)

```bash
# Exporter seulement les données (sans schéma)
pg_dump -h localhost -U root --data-only -d gardeready > data.sql

# Exporter seulement une table
pg_dump -h localhost -U root -t users -d gardeready > users.sql
```

## Docker Compose

### Configuration

**Fichier**: `docker-compose.yml`

```yaml
database:
  image: postgres:latest
  container_name: gardeReady-database
  environment:
    POSTGRES_USER: root
    POSTGRES_PASSWORD: root
    POSTGRES_DB: gardeready
  ports:
    - "5432:5432"
  volumes:
    - ./Sources/database/initdb:/docker-entrypoint-initdb.d
    - postgres_data:/var/lib/postgresql/data
```

### Initialisation automatique

Tous les fichiers `.sql` dans `Sources/database/initdb/` sont exécutés automatiquement au premier démarrage du conteneur.

### Commandes Docker utiles

```bash
# Démarrer la base de données
docker-compose up database -d

# Voir les logs
docker logs gardeReady-database

# Accéder au shell PostgreSQL
docker exec -it gardeReady-database psql -U root -d gardeready

# Réinitialiser complètement (supprime toutes les données!)
docker-compose down -v
docker-compose up database -d
```

## Performances et optimisation

### Index

Les index accélèrent les recherches mais ralentissent les insertions:

```sql
-- Index sur les colonnes fréquemment recherchées
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sections_vehicule ON sections(vehicule_id);
CREATE INDEX idx_elements_section ON elements(section_id);

-- Index composite pour les requêtes complexes
CREATE INDEX idx_sections_lookup ON sections(vehicule_id, parent_section_id);
```

### Analyse des requêtes lentes

```sql
-- Activer le logging des requêtes lentes (>100ms)
ALTER DATABASE gardeready SET log_min_duration_statement = 100;

-- Analyser une requête
EXPLAIN ANALYZE
SELECT * FROM sections WHERE vehicule_id = 1;
```

### Vacuum et maintenance

```sql
-- Nettoyer et analyser les tables
VACUUM ANALYZE;

-- Stats sur une table
SELECT * FROM pg_stat_user_tables WHERE relname = 'users';
```

## Sécurité

### Permissions

```sql
-- Créer un utilisateur en lecture seule
CREATE USER readonly_user WITH PASSWORD 'motdepasse';
GRANT CONNECT ON DATABASE gardeready TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Révoquer les permissions
REVOKE ALL ON DATABASE gardeready FROM readonly_user;
```

### SSL en production

Toujours activer SSL pour les connexions distantes:

```typescript
dialectOptions: {
    ssl: {
        require: true,
        rejectUnauthorized: false  // Ou true avec certificat valide
    }
}
```

## Bonnes pratiques

1. **Toujours** utiliser des transactions pour les opérations complexes
2. **Ne jamais** stocker de mots de passe en clair
3. **Toujours** valider les données avant insertion
4. **Utiliser** des migrations pour les modifications de schéma en production
5. **Faire** des backups réguliers
6. **Tester** les requêtes complexes avec EXPLAIN ANALYZE
7. **Éviter** les requêtes N+1 (utiliser les includes Sequelize)
8. **Indexer** les colonnes de foreign keys
9. **Limiter** les résultats des requêtes (LIMIT/OFFSET)
10. **Logger** les erreurs SQL en développement

## Dépannage

### Erreur de connexion

```bash
# Vérifier que PostgreSQL est démarré
docker ps | grep postgres

# Vérifier les logs
docker logs gardeReady-database

# Tester la connexion
docker exec -it gardeReady-database psql -U root -d gardeready
```

### Réinitialiser les données

```bash
# Méthode 1: Supprimer le volume Docker
docker-compose down -v
docker-compose up -d

# Méthode 2: Supprimer manuellement les tables
docker exec -it gardeReady-database psql -U root -d gardeready
DROP TABLE elements CASCADE;
DROP TABLE sections CASCADE;
DROP TABLE vehicules CASCADE;
DROP TABLE gardes CASCADE;
DROP TABLE users CASCADE;
```

### Vérifier l'intégrité des données

```sql
-- Vérifier les orphelins (utilisateurs sans garde)
SELECT * FROM users WHERE garde_id IS NOT NULL AND garde_id NOT IN (SELECT id FROM gardes);

-- Vérifier les sections invalides
SELECT * FROM sections 
WHERE (vehicule_id IS NULL AND parent_section_id IS NULL)
   OR (vehicule_id IS NOT NULL AND parent_section_id IS NOT NULL);
```
