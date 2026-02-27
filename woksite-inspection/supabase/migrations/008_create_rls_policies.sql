-- Migration 008: RLS policies
-- Référence: données de référence en lecture libre
ALTER TABLE phase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phase_select" ON phase FOR SELECT USING (true);

ALTER TABLE checklist_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_item_select" ON checklist_item FOR SELECT USING (true);

-- Chantier: auth requise, filtre soft-delete
ALTER TABLE chantier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chantier_select" ON chantier FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);
CREATE POLICY "chantier_insert" ON chantier FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "chantier_update" ON chantier FOR UPDATE
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

-- Entreprise
ALTER TABLE entreprise ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entreprise_select" ON entreprise FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);
CREATE POLICY "entreprise_insert" ON entreprise FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "entreprise_update" ON entreprise FOR UPDATE
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

-- ChantierEntreprise
ALTER TABLE chantier_entreprise ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chantier_entreprise_select" ON chantier_entreprise FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "chantier_entreprise_insert" ON chantier_entreprise FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "chantier_entreprise_delete" ON chantier_entreprise FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Visite
ALTER TABLE visite ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visite_select" ON visite FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);
CREATE POLICY "visite_insert" ON visite FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "visite_update" ON visite FOR UPDATE
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

-- ReponseVisite
ALTER TABLE reponse_visite ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reponse_visite_select" ON reponse_visite FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "reponse_visite_insert" ON reponse_visite FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reponse_visite_update" ON reponse_visite FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Ecart
ALTER TABLE ecart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ecart_select" ON ecart FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);
CREATE POLICY "ecart_insert" ON ecart FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ecart_update" ON ecart FOR UPDATE
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);
