-- Migration 010: Rendre visite_id nullable sur ecart
-- Justification: Un STOP Danger peut être déclenché hors contexte de visite
ALTER TABLE ecart ALTER COLUMN visite_id DROP NOT NULL;
