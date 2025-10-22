-- Création de la table users
CREATE TABLE users (
    id SERIAL PRIMARY KEY, -- Identifiant unique pour chaque utilisateur
    email VARCHAR(100) NOT NULL UNIQUE, -- Adresse e-mail de l'utilisateur
    password VARCHAR(255) NOT NULL, -- Mot de passe de l'utilisateur
    firstname VARCHAR(50) NOT NULL, -- Prénom de l'utilisateur
    lastname VARCHAR(50) NOT NULL, -- name de l'utilisateur
    role VARCHAR(20) NOT NULL DEFAULT 'user' -- Rôle de l'utilisateur (par ex: 'user', 'admin')
);

-- Création de la table gardes
CREATE TABLE gardes (
    id SERIAL PRIMARY KEY, -- Identifiant unique pour chaque garde
    name VARCHAR(50) NOT NULL UNIQUE, -- Numéro de la garde
    color VARCHAR(50) NOT NULL -- color de la garde
);

-- Création de la table vehicules
CREATE TABLE vehicules (
    id SERIAL PRIMARY KEY, -- Identifiant unique pour chaque véhicule
    name VARCHAR(100) NOT NULL -- name du véhicule
);

-- Création de la table elements
CREATE TABLE elements (
    id SERIAL PRIMARY KEY, -- Identifiant unique pour chaque élément
    name VARCHAR(100) NOT NULL -- name de l'élément
);

-- Création de la table sections (hiérarchique)
CREATE TABLE sections (
    id SERIAL PRIMARY KEY, -- Identifiant unique pour chaque section
    name VARCHAR(100) NOT NULL, -- Nom de la section
    vehicule_id INT, -- Clé étrangère vers vehicules (nullable, seulement pour les sections racines)
    parent_section_id INT, -- Clé étrangère auto-référentielle (nullable pour les sections racines)
    CONSTRAINT fk_section_vehicule FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    CONSTRAINT fk_section_parent FOREIGN KEY (parent_section_id) REFERENCES sections(id) ON DELETE CASCADE,
    CONSTRAINT check_section_root CHECK (
        (vehicule_id IS NOT NULL AND parent_section_id IS NULL) OR -- Section racine
        (vehicule_id IS NULL AND parent_section_id IS NOT NULL)    -- Sous-section
    )
);

-- Modification de la table elements pour référencer une section
ALTER TABLE elements
ADD COLUMN section_id INT,
ADD CONSTRAINT fk_element_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;

-- Ajout des clés étrangères après la création de toutes les tables
ALTER TABLE users
ADD COLUMN garde_id INT,
ADD CONSTRAINT fk_garde FOREIGN KEY (garde_id) REFERENCES gardes(id) ON DELETE CASCADE;

ALTER TABLE gardes
ADD COLUMN responsable INT NOT NULL,
ADD CONSTRAINT fk_responsable FOREIGN KEY (responsable) REFERENCES users(id) ON DELETE CASCADE;

-- Insertion des données dans les tables
-- Table users (mots de passe cryptés avec bcrypt)
-- Admin: email=admin@sdis49.fr, password=Admin123!
-- Users: email=user@sdis49.fr, password=User123!
INSERT INTO users (email, password, firstname, lastname, role) VALUES
('admin@sdis49.fr', '$2b$12$WDbdJ/06.C7uaRxE9cLOLO0uh80PTijl8aYDgsaiJJpHnOli9XF9K', 'Admin', 'Test', 'admin'),
('user@sdis49.fr', '$2b$12$bgRR59xphxhr5czNCvzUGuyfCv5VbMKsk2eZI/01U63kwz3ac5jN2', 'User', 'Test', 'user'),
('john.doe@sdis49.fr', '$2b$12$bgRR59xphxhr5czNCvzUGuyfCv5VbMKsk2eZI/01U63kwz3ac5jN2', 'John', 'Doe', 'user'),
('jane.smith@sdis49.fr', '$2b$12$bgRR59xphxhr5czNCvzUGuyfCv5VbMKsk2eZI/01U63kwz3ac5jN2', 'Jane', 'Smith', 'user');

-- Table gardes
INSERT INTO gardes (name, color, responsable) VALUES
('Garde 1', 'Rouge', 1), -- Responsable : Admin Test
('Garde 2', 'jaune', 3), -- Responsable : John Doe
('Garde 3', 'Vert', 4); -- Responsable : Jane Smith

SELECT * FROM users;

-- Mise à jour de la table users avec les IDs de garde
UPDATE users SET garde_id = 1 WHERE id = 1; -- Admin Test est assigné à la garde 1
UPDATE users SET garde_id = 1 WHERE id = 2; -- User Test est assigné à la garde 1
UPDATE users SET garde_id = 2 WHERE id = 3; -- John Doe est assigné à la garde 2
UPDATE users SET garde_id = 3 WHERE id = 4; -- Jane Smith est assignée à la garde 3

-- Table vehicules
INSERT INTO vehicules (name) VALUES
('VSAV'),
('Camion de pompier'),
('Voiture de police');

-- Table sections (hiérarchique)
-- Sections racines (attachées aux véhicules)
INSERT INTO sections (name, vehicule_id) VALUES
('Sac prompt secours', 1),      -- Section racine du VSAV
('Extérieur', 1),               -- Section extérieur du VSAV
('Compartiment principal', 2),   -- Section principale du camion
('Cabine', 3);                  -- Section cabine de la voiture

-- Sous-sections (attachées aux sections parentes)
INSERT INTO sections (name, parent_section_id) VALUES
('Poche bleue', 1),             -- Sous-section dans le sac prompt secours
('Poche rouge', 1),             -- Autre sous-section dans le sac prompt secours
('Tiroir gauche', 3),           -- Sous-section dans le compartiment principal
('Tiroir droit', 3);            -- Autre sous-section dans le compartiment principal

-- Table elements avec leur section
INSERT INTO elements (name, section_id) VALUES
('Thermomètre', 5),             -- Dans la poche bleue
('Saturomètre', 5),             -- Dans la poche bleue
('Tensiomètre', 6),             -- Dans la poche rouge
('Phare', 2),                   -- Dans l'extérieur du VSAV
('Extincteur', 7),              -- Dans le tiroir gauche du camion
('Sirène', 4),                  -- Dans la cabine de la voiture de police
('Trousse de secours', 8);      -- Dans le tiroir droit du camion

SELECT * FROM users;