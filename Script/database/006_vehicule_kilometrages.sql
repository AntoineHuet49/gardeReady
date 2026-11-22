-- Suivi kilométrique : un relevé par saisie d'un agent à la fin d'une intervention / manœuvre.
-- À appliquer sur RE7 (staging) puis sur la production lors de la promotion.
CREATE TABLE IF NOT EXISTS vehicule_kilometrages (
    id SERIAL PRIMARY KEY,
    vehicule_id INT NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kilometrage INT NOT NULL CHECK (kilometrage >= 0),
    motif VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
