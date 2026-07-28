-- Migration : ajout du support OAuth2 Microsoft (Entra ID / SDIS)
-- À exécuter manuellement sur une base déjà déployée (les nouvelles installations
-- utilisent directement Sources/database/initdb/init.sql ou Script/database/init-deployment.sql).

-- Les comptes créés via Microsoft n'ont pas de mot de passe local.
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Un compte créé automatiquement à la première connexion Microsoft n'a pas encore de garde assignée.
ALTER TABLE users ALTER COLUMN garde_id DROP NOT NULL;

-- Identifiant Azure AD (claim "oid" du token Microsoft) permettant de lier un compte local
-- à une identité Microsoft de façon stable (plus fiable qu'un simple re-match par email).
ALTER TABLE users ADD COLUMN IF NOT EXISTS azure_oid VARCHAR(100) UNIQUE;
