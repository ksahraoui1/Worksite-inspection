-- Migration 005: Table visite (FK → chantier, phase, soft-delete)
CREATE TABLE visite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chantier_id UUID NOT NULL REFERENCES chantier(id),
  phase_id UUID NOT NULL REFERENCES phase(id),
  inspecteur_nom TEXT NOT NULL,
  inspecteur_id UUID,
  date_visite TIMESTAMPTZ NOT NULL DEFAULT now(),
  statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'terminee')),
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
