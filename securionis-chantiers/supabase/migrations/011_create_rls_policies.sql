-- 011: Enable RLS on all tables and create access policies

-- ============================================================
-- Enable RLS
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_controle      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chantiers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinataires        ENABLE ROW LEVEL SECURITY;
ALTER TABLE visites              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reponses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecarts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE chantier_inspecteurs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: returns the current user's role
-- Placed in PUBLIC schema (not auth) for Supabase cloud compat
-- ============================================================

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- profiles
-- ============================================================

CREATE POLICY profiles_select_own ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_select_admin ON profiles
    FOR SELECT USING (public.user_role() = 'administrateur');

CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================================
-- phases (read-only for all authenticated users)
-- ============================================================

CREATE POLICY phases_select ON phases
    FOR SELECT TO authenticated
    USING (true);

-- ============================================================
-- categories (read-only for all authenticated users)
-- ============================================================

CREATE POLICY categories_select ON categories
    FOR SELECT TO authenticated
    USING (true);

-- ============================================================
-- points_controle
-- ============================================================

CREATE POLICY pc_select_active ON points_controle
    FOR SELECT TO authenticated
    USING (actif = true);

CREATE POLICY pc_insert_admin ON points_controle
    FOR INSERT TO authenticated
    WITH CHECK (
        public.user_role() = 'administrateur'
        AND is_custom = true
    );

CREATE POLICY pc_update_admin ON points_controle
    FOR UPDATE TO authenticated
    USING (
        public.user_role() = 'administrateur'
        AND is_custom = true
    )
    WITH CHECK (
        public.user_role() = 'administrateur'
        AND is_custom = true
    );

-- ============================================================
-- chantiers
-- ============================================================

CREATE POLICY chantiers_inspecteur_select ON chantiers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = chantiers.id
              AND ci.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY chantiers_inspecteur_insert ON chantiers
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY chantiers_admin_all ON chantiers
    FOR ALL TO authenticated
    USING (public.user_role() = 'administrateur')
    WITH CHECK (public.user_role() = 'administrateur');

-- ============================================================
-- destinataires (access via chantier ownership)
-- ============================================================

CREATE POLICY destinataires_inspecteur_select ON destinataires
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = destinataires.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY destinataires_inspecteur_manage ON destinataires
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = destinataires.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = destinataires.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY destinataires_admin_all ON destinataires
    FOR ALL TO authenticated
    USING (public.user_role() = 'administrateur')
    WITH CHECK (public.user_role() = 'administrateur');

-- ============================================================
-- visites
-- ============================================================

CREATE POLICY visites_inspecteur_select ON visites
    FOR SELECT TO authenticated
    USING (
        inspecteur_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = visites.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY visites_inspecteur_insert ON visites
    FOR INSERT TO authenticated
    WITH CHECK (
        inspecteur_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = visites.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY visites_inspecteur_update ON visites
    FOR UPDATE TO authenticated
    USING (inspecteur_id = auth.uid())
    WITH CHECK (inspecteur_id = auth.uid());

CREATE POLICY visites_admin_all ON visites
    FOR ALL TO authenticated
    USING (public.user_role() = 'administrateur')
    WITH CHECK (public.user_role() = 'administrateur');

-- ============================================================
-- reponses (access via visite ownership)
-- ============================================================

CREATE POLICY reponses_inspecteur_select ON reponses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM visites v
            WHERE v.id = reponses.visite_id
              AND v.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY reponses_inspecteur_insert ON reponses
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM visites v
            WHERE v.id = reponses.visite_id
              AND v.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY reponses_inspecteur_update ON reponses
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM visites v
            WHERE v.id = reponses.visite_id
              AND v.inspecteur_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM visites v
            WHERE v.id = reponses.visite_id
              AND v.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY reponses_admin_all ON reponses
    FOR ALL TO authenticated
    USING (public.user_role() = 'administrateur')
    WITH CHECK (public.user_role() = 'administrateur');

-- ============================================================
-- ecarts (access via chantier ownership)
-- ============================================================

CREATE POLICY ecarts_inspecteur_select ON ecarts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = ecarts.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY ecarts_inspecteur_insert ON ecarts
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = ecarts.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY ecarts_inspecteur_update ON ecarts
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = ecarts.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chantier_inspecteurs ci
            WHERE ci.chantier_id = ecarts.chantier_id
              AND ci.inspecteur_id = auth.uid()
        )
    );

CREATE POLICY ecarts_admin_all ON ecarts
    FOR ALL TO authenticated
    USING (public.user_role() = 'administrateur')
    WITH CHECK (public.user_role() = 'administrateur');

-- ============================================================
-- chantier_inspecteurs
-- ============================================================

CREATE POLICY ci_inspecteur_select ON chantier_inspecteurs
    FOR SELECT TO authenticated
    USING (inspecteur_id = auth.uid());

CREATE POLICY ci_admin_all ON chantier_inspecteurs
    FOR ALL TO authenticated
    USING (public.user_role() = 'administrateur')
    WITH CHECK (public.user_role() = 'administrateur');
