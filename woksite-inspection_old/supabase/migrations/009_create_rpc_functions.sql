-- Migration 009: Fonctions RPC pour le dashboard

-- Fonction: get_ecarts_en_retard
-- Retourne le nombre d'écarts en retard par chantier actif
CREATE OR REPLACE FUNCTION get_ecarts_en_retard()
RETURNS TABLE (chantier_id UUID, count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    v.chantier_id,
    COUNT(e.id) AS count
  FROM ecart e
  JOIN visite v ON v.id = e.visite_id
  JOIN chantier c ON c.id = v.chantier_id
  WHERE e.deleted_at IS NULL
    AND e.statut != 'resolu'
    AND e.delai_resolution < CURRENT_DATE
    AND v.deleted_at IS NULL
    AND c.deleted_at IS NULL
    AND c.statut = 'actif'
  GROUP BY v.chantier_id;
$$;
