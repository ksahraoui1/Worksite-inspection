-- Migration 006: Tables reponse_visite et ecart
CREATE TABLE reponse_visite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visite_id UUID NOT NULL REFERENCES visite(id),
  checklist_item_id UUID NOT NULL REFERENCES checklist_item(id),
  resultat TEXT NOT NULL CHECK (resultat IN ('conforme', 'non_conforme', 'non_applicable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (visite_id, checklist_item_id)
);

CREATE TABLE ecart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visite_id UUID NOT NULL REFERENCES visite(id),
  checklist_item_id UUID NOT NULL REFERENCES checklist_item(id),
  entreprise_id UUID REFERENCES entreprise(id),
  constat TEXT NOT NULL,
  photo_url TEXT,
  severite TEXT NOT NULL DEFAULT 'a_corriger' CHECK (severite IN ('a_corriger', 'stop_danger')),
  statut TEXT NOT NULL DEFAULT 'a_corriger' CHECK (statut IN ('a_corriger', 'stop_danger', 'resolu')),
  delai_resolution DATE,
  date_resolution TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
