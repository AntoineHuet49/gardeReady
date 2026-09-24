-- Migration : quantité d'un équipement indépendante de son nom (issue #7)
-- À exécuter manuellement sur une base déjà déployée (les nouvelles installations
-- utilisent directement Sources/database/initdb/init.sql ou Script/database/init-deployment.sql).
-- Idempotente : peut être rejouée sans effet. Les équipements existants prennent la quantité 1.

ALTER TABLE elements ADD COLUMN IF NOT EXISTS quantite INTEGER NOT NULL DEFAULT 1 CHECK (quantite >= 1);
