-- Migration 003: Table chantier (soft-delete)
CREATE TABLE chantier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  adresse TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin_prevue DATE,
  responsable_securite TEXT NOT NULL,
  responsable_email TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'termine')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
