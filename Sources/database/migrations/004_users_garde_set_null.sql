-- Migration : supprimer une garde ne supprime plus ses membres (issue #60)
-- À exécuter manuellement sur une base déjà déployée (RE7 puis prod). Les nouvelles installations
-- utilisent directement Sources/database/initdb/init.sql ou Script/database/init-deployment.sql.
-- Le nom de la contrainte diffère selon l'installation (fk_garde via init.sql, fk_user_garde via init-deployment.sql).

ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_garde;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_user_garde;
ALTER TABLE users
ADD CONSTRAINT fk_user_garde FOREIGN KEY (garde_id) REFERENCES gardes(id) ON DELETE SET NULL;
