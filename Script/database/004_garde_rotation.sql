-- Planning des gardes : date de référence de la rotation (ligne unique).
-- À appliquer sur RE7 (staging) puis sur la production lors de la promotion.
CREATE TABLE IF NOT EXISTS garde_rotation (
    id INT PRIMARY KEY CHECK (id = 1),
    reference_date DATE NOT NULL CHECK (EXTRACT(ISODOW FROM reference_date) = 5)
);
