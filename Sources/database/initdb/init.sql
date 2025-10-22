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