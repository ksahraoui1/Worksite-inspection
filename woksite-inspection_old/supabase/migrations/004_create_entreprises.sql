-- Migration 004: Tables entreprise et chantier_entreprise (M:N)
CREATE TABLE entreprise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  corps_metier TEXT NOT NULL,
  contact_nom TEXT,
  contact_email TEXT,
  contact_telephone TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chantier_entreprise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chantier_id UUID NOT NULL REFERENCES chantier(id),
  entreprise_id UUID NOT NULL REFERENCES entreprise(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chantier_id, entreprise_id)
);
