-- Script SQL optimisé pour le déploiement Railway
-- Contient uniquement les tables essentielles et un compte admin

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
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(50) NOT NULL,
    responsable INT
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
    vehicule_id INT,
    parent_section_id INT
);

-- Création de la table elements
CREATE TABLE elements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    section_id INT
);

-- Ajout des contraintes de clés étrangères
ALTER TABLE users
ADD CONSTRAINT fk_user_garde FOREIGN KEY (garde_id) REFERENCES gardes(id) ON DELETE SET NULL;

ALTER TABLE gardes
ADD CONSTRAINT fk_garde_responsable FOREIGN KEY (responsable) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE sections
ADD CONSTRAINT fk_section_vehicule FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_section_parent FOREIGN KEY (parent_section_id) REFERENCES sections(id) ON DELETE CASCADE;

ALTER TABLE elements
ADD CONSTRAINT fk_element_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;

-- Insertion du compte administrateur
-- Email: admin@gardeready.com
-- Mot de passe: AdminReady2024!
-- Hash généré avec bcrypt (coût 12)
INSERT INTO users (email, password, firstname, lastname, role) VALUES
('admin@gardeready.com', '$2b$12$8K9vN3QFmGpL2xR4tY6uZ.HjWkE5PnDqS7vC9mA2bF8hI3jK0lM6N', 'Admin', 'GardeReady', 'admin');

-- Création d'une garde par défaut et assignation de l'admin
INSERT INTO gardes (name, color, responsable) VALUES
('Administration', 'Bleu', 1);

-- Assignation de l'admin à la garde d'administration
UPDATE users SET garde_id = 1 WHERE id = 1;

-- Vérification des données insérées
SELECT 
    u.id,
    u.email,
    u.firstname,
    u.lastname,
    u.role,
    g.name as garde_name
FROM users u
LEFT JOIN gardes g ON u.garde_id = g.id;