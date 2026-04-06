-- Migration 002: Table checklist_item (données de référence, FK → phase)
CREATE TABLE checklist_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES phase(id),
  corps_metier TEXT,
  question TEXT NOT NULL,
  reference_legale TEXT NOT NULL,
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
