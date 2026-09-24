-- Migration : photo d'une section (issue #8)
-- À exécuter manuellement sur une base déjà déployée (idempotent). Les nouvelles installations
-- utilisent directement Sources/database/initdb/init.sql ou Script/database/init-deployment.sql.

-- L'image est stockée en base (pas de disque persistant sur Railway), servie par GET /api/sections/:id/photo.
ALTER TABLE sections ADD COLUMN IF NOT EXISTS photo BYTEA;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS photo_mime VARCHAR(50);
