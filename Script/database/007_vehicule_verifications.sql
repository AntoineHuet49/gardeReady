-- Historique des vérifications de véhicules. À appliquer sur RE7 (staging) puis sur la production.
-- mail_envoye = false quand l'envoi du rapport au responsable a échoué (la vérification est conservée).
CREATE TABLE IF NOT EXISTS vehicule_verifications (
    id SERIAL PRIMARY KEY,
    vehicule_id INT NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    garde_id INT REFERENCES gardes(id) ON DELETE SET NULL,
    results JSONB NOT NULL,
    mail_envoye BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
