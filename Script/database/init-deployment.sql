-- Script SQL optimisé pour le déploiement Railway
-- Contient uniquement les tables essentielles et un compte admin

-- Nettoyer les tables existantes (évite les conflits)
DROP TABLE IF EXISTS elements CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS vehicules CASCADE;
DROP TABLE IF EXISTS gardes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Création de la table users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    garde_id INT
);

-- Création de la table gardes
CREATE TABLE gardes (
    id SERIAL PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    color VARCHAR(50) NOT NULL,
    responsable INT NULL
);

-- Création de la table vehicules
CREATE TABLE vehicules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Création de la table sections (hiérarchique)
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicule_id INT REFERENCES vehicules(id) ON DELETE CASCADE,
    parent_section_id INT REFERENCES sections(id) ON DELETE CASCADE
);

-- Création de la table elements
CREATE TABLE elements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE
);

-- Ajout des contraintes de clés étrangères
ALTER TABLE users
ADD CONSTRAINT fk_user_garde FOREIGN KEY (garde_id) REFERENCES gardes(id) ON DELETE SET NULL;

ALTER TABLE gardes
ADD CONSTRAINT fk_garde_responsable FOREIGN KEY (responsable) REFERENCES users(id) ON DELETE SET NULL;

-- Insertion du compte administrateur
-- Email: admin@gardeready.com
-- Mot de passe: AdminReady2024!
-- Hash généré avec bcrypt (coût 12)
INSERT INTO users (email, password, firstname, lastname, role)
VALUES ('admin@gardeready.com', '$2b$12$D0VYrObMzX2rXZ8bGG9wqebzhMS4brxMkMDHzmUDfg.OdlRoE5piK', 'Admin', 'GardeReady', 'superAdmin');

-- Création d'une garde par défaut et assignation de l'admin
INSERT INTO gardes (numero, color, responsable)

-- Assignation de l'admin à la garde d'administration
UPDATE users SET garde_id = 1 WHERE email = 'admin@gardeready.com';

-- Vérification des données insérées
SELECT 
    u.id,
    u.email,
    u.firstname,
    u.lastname,
    u.role,
    g.numero as garde_numero
FROM users u
LEFT JOIN gardes g ON u.garde_id = g.id;