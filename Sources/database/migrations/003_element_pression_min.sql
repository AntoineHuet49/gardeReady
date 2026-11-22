-- Migration : pression minimale (bar) d'un équipement, ex. bouteille d'ARI (issue #57)
-- À exécuter manuellement sur une base déjà déployée. Idempotente. NULL = pas de pression minimale.

ALTER TABLE elements ADD COLUMN IF NOT EXISTS pression_min INTEGER CHECK (pression_min >= 1);
