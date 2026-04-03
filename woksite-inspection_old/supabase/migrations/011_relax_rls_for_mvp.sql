-- Migration 011: Assouplir RLS pour le MVP (pas d'auth encore)
-- TODO: Rétablir auth.uid() IS NOT NULL quand l'authentification sera implémentée

-- Chantier
DROP POLICY "chantier_select" ON chantier;
DROP POLICY "chantier_insert" ON chantier;
DROP POLICY "chantier_update" ON chantier;
CREATE POLICY "chantier_select" ON chantier FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "chantier_insert" ON chantier FOR INSERT WITH CHECK (true);
CREATE POLICY "chantier_update" ON chantier FOR UPDATE USING (deleted_at IS NULL);

-- Entreprise
DROP POLICY "entreprise_select" ON entreprise;
DROP POLICY "entreprise_insert" ON entreprise;
DROP POLICY "entreprise_update" ON entreprise;
CREATE POLICY "entreprise_select" ON entreprise FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "entreprise_insert" ON entreprise FOR INSERT WITH CHECK (true);
CREATE POLICY "entreprise_update" ON entreprise FOR UPDATE USING (deleted_at IS NULL);

-- ChantierEntreprise
DROP POLICY "chantier_entreprise_select" ON chantier_entreprise;
DROP POLICY "chantier_entreprise_insert" ON chantier_entreprise;
DROP POLICY "chantier_entreprise_delete" ON chantier_entreprise;
CREATE POLICY "chantier_entreprise_select" ON chantier_entreprise FOR SELECT USING (true);
CREATE POLICY "chantier_entreprise_insert" ON chantier_entreprise FOR INSERT WITH CHECK (true);
CREATE POLICY "chantier_entreprise_delete" ON chantier_entreprise FOR DELETE USING (true);

-- Visite
DROP POLICY "visite_select" ON visite;
DROP POLICY "visite_insert" ON visite;
DROP POLICY "visite_update" ON visite;
CREATE POLICY "visite_select" ON visite FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "visite_insert" ON visite FOR INSERT WITH CHECK (true);
CREATE POLICY "visite_update" ON visite FOR UPDATE USING (deleted_at IS NULL);

-- ReponseVisite
DROP POLICY "reponse_visite_select" ON reponse_visite;
DROP POLICY "reponse_visite_insert" ON reponse_visite;
DROP POLICY "reponse_visite_update" ON reponse_visite;
CREATE POLICY "reponse_visite_select" ON reponse_visite FOR SELECT USING (true);
CREATE POLICY "reponse_visite_insert" ON reponse_visite FOR INSERT WITH CHECK (true);
CREATE POLICY "reponse_visite_update" ON reponse_visite FOR UPDATE USING (true);

-- Ecart
DROP POLICY "ecart_select" ON ecart;
DROP POLICY "ecart_insert" ON ecart;
DROP POLICY "ecart_update" ON ecart;
CREATE POLICY "ecart_select" ON ecart FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "ecart_insert" ON ecart FOR INSERT WITH CHECK (true);
CREATE POLICY "ecart_update" ON ecart FOR UPDATE USING (deleted_at IS NULL);
