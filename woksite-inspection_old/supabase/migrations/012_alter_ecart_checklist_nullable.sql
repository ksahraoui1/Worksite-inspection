-- Migration 012: Rendre checklist_item_id nullable sur ecart
-- Justification: Un STOP Danger peut être déclenché hors contexte de visite/checklist
ALTER TABLE ecart ALTER COLUMN checklist_item_id DROP NOT NULL;
