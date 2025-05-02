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

-- Création de la table vehicules_elements
CREATE TABLE vehicules_elements (
    vehicule_id INT NOT NULL, -- Clé étrangère vers vehicules
    element_id INT NOT NULL, -- Clé étrangère vers elements
    PRIMARY KEY (vehicule_id, element_id) -- Clé primaire composée
);

-- Ajout des clés étrangères après la création de toutes les tables
ALTER TABLE users
ADD COLUMN garde_id INT,
ADD CONSTRAINT fk_garde FOREIGN KEY (garde_id) REFERENCES gardes(id) ON DELETE CASCADE;

ALTER TABLE gardes
ADD COLUMN responsable INT NOT NULL,
ADD CONSTRAINT fk_responsable FOREIGN KEY (responsable) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE vehicules_elements
ADD CONSTRAINT fk_vehicule FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_elements FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE,
ADD CONSTRAINT vehicules_elements_unique UNIQUE (vehicule_id, element_id);

-- Insertion des données dans les tables
-- Table users
INSERT INTO users (email, password, firstname, lastname, role) VALUES
('antoine.200@orange.fr', 'test', 'Antoine', 'Huet', 'admin'),
('john.doe@example.com', 'test', 'John', 'Doe', 'user'),
('jane.smith@example.com', 'test', 'Jane', 'Smith', 'user'),
('alice.jones@example.com', 'test', 'Alice', 'Jones', 'user');

-- Table gardes
INSERT INTO gardes (name, color, responsable) VALUES
('Garde 1', 'Rouge', 1), -- Responsable : Antoine Huet
('Garde 2', 'jaune', 3), -- Responsable : Jane Smith
('Garde 3', 'Vert', 4); -- Responsable : Alice Jones

SELECT * FROM users;

-- Mise à jour de la table users avec les IDs de garde
UPDATE users SET garde_id = 1 WHERE id = 1; -- Antoine Huet est assigné à la garde G001
UPDATE users SET garde_id = 1 WHERE id = 2; -- John Doe est assigné à la garde G001
UPDATE users SET garde_id = 2 WHERE id = 3; -- Jane Smith est assignée à la garde G002
UPDATE users SET garde_id = 3 WHERE id = 4; -- Alice Jones est assignée à la garde G003

-- Table vehicules
INSERT INTO vehicules (name) VALUES
('Camion de pompier'),
('Voiture de police'),
('Ambulance');

-- Table elements
INSERT INTO elements (name) VALUES
('Extincteur'),
('Sirène'),
('Trousse de secours');

-- Table vehicules_elements
INSERT INTO vehicules_elements (vehicule_id, element_id) VALUES
(1, 1), -- Camion de pompier - Extincteur
(1, 2), -- Camion de pompier - Sirène
(2, 2), -- Voiture de police - Sirène
(3, 3); -- Ambulance - Trousse de secours

SELECT * FROM users;