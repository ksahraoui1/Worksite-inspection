-- Migration 007: Index recommandés (data-model.md)
CREATE INDEX idx_visite_chantier ON visite(chantier_id);
CREATE INDEX idx_visite_date ON visite(date_visite DESC);
CREATE INDEX idx_ecart_visite ON ecart(visite_id);
CREATE INDEX idx_ecart_statut ON ecart(statut) WHERE deleted_at IS NULL;
CREATE INDEX idx_ecart_delai ON ecart(delai_resolution)
  WHERE statut != 'resolu' AND deleted_at IS NULL;
CREATE INDEX idx_checklist_phase ON checklist_item(phase_id);
CREATE INDEX idx_chantier_statut ON chantier(statut) WHERE deleted_at IS NULL;
