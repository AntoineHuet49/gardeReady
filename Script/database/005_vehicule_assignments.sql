-- Assignation des agents aux véhicules à vérifier pour la prise de garde d'une semaine.
-- shift_date = vendredi de relève ; la garde se déduit de la rotation (table garde_rotation).
-- À appliquer sur RE7 (staging) puis sur la production lors de la promotion.
CREATE TABLE IF NOT EXISTS vehicule_assignments (
    id SERIAL PRIMARY KEY,
    shift_date DATE NOT NULL CHECK (EXTRACT(ISODOW FROM shift_date) = 5),
    vehicule_id INT NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (shift_date, vehicule_id, user_id)
);
