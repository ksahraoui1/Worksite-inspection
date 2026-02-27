-- Migration 013: Ajouter chantier_id sur ecart pour les STOP Danger hors visite
ALTER TABLE ecart ADD COLUMN chantier_id UUID REFERENCES chantier(id);

-- Rétro-remplir chantier_id depuis visite pour les écarts existants liés à une visite
UPDATE ecart
SET chantier_id = v.chantier_id
FROM visite v
WHERE ecart.visite_id = v.id AND ecart.chantier_id IS NULL;
