-- Historique des vérifications de véhicules. À appliquer sur RE7 (staging) puis sur la production.
CREATE TABLE IF NOT EXISTS vehicule_verifications (
    id SERIAL PRIMARY KEY,
    vehicule_id INT NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    garde_id INT REFERENCES gardes(id) ON DELETE SET NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
