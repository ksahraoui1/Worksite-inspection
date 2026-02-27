-- Migration 001: Table phase (données de référence)
CREATE TABLE phase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INT NOT NULL UNIQUE CHECK (numero BETWEEN 1 AND 5),
  nom TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
