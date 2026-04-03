# Data Model: Controle Chantier

**Feature**: 001-controle-chantier
**Date**: 2026-02-27
**Source**: spec.md (Clarified) + constitution.md v1.0.0

## Entity Relationship Diagram (Text)

```
Chantier 1──N Visite
Chantier M──N Entreprise  (via ChantierEntreprise)
Visite   1──N ReponseVisite
Visite   1──N Ecart
ChecklistItem 1──N ReponseVisite
ChecklistItem 1──N Ecart
Entreprise 1──N Ecart
Phase 1──N ChecklistItem
Phase 1──N Visite
```

## Entities

### Phase (donnees de reference)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| numero | INT | NOT NULL, UNIQUE, CHECK(1..5) | Numero de phase (1-5) |
| nom | TEXT | NOT NULL | Nom de la phase |
| description | TEXT | | Description detaillee |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Date de creation |

**Donnees de seed**: 5 phases fixes (Preparation, Fouilles, Gros oeuvre, Enveloppe, Second oeuvre).

### ChecklistItem (donnees de reference)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| phase_id | UUID | FK → Phase.id, NOT NULL | Phase associee |
| corps_metier | TEXT | NULLABLE | Corps de metier (null = tous) |
| question | TEXT | NOT NULL | Texte du point de controle |
| reference_legale | TEXT | NOT NULL | Ref OTConst/SUVA (ex: "OTConst Art. 26") |
| ordre | INT | NOT NULL, default 0 | Ordre d'affichage |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Date de creation |

**Contrainte constitution**: reference_legale est NOT NULL (Principe I).

### Chantier

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| nom | TEXT | NOT NULL | Nom du chantier |
| adresse | TEXT | NOT NULL | Adresse complete |
| date_debut | DATE | NOT NULL | Date de debut |
| date_fin_prevue | DATE | NULLABLE | Date de fin prevue |
| responsable_securite | TEXT | NOT NULL | Nom du responsable securite |
| responsable_email | TEXT | NOT NULL | Email du responsable (notifications) |
| statut | TEXT | NOT NULL, CHECK('actif','termine'), default 'actif' | Statut du chantier |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Date de creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Derniere modification |

**Validation**: Un chantier DOIT avoir un responsable_email valide (FR-009, notification STOP Danger). Un chantier avec ecarts non resolus ne peut etre cloture sans confirmation (FR-014).

### Entreprise

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| nom | TEXT | NOT NULL | Nom de l'entreprise |
| corps_metier | TEXT | NOT NULL | Corps de metier principal |
| contact_nom | TEXT | NULLABLE | Nom du contact |
| contact_email | TEXT | NULLABLE | Email du contact |
| contact_telephone | TEXT | NULLABLE | Telephone du contact |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Date de creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Derniere modification |

### ChantierEntreprise (table de jointure)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| chantier_id | UUID | FK → Chantier.id, NOT NULL | Chantier |
| entreprise_id | UUID | FK → Entreprise.id, NOT NULL | Entreprise |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Date d'association |

**Contrainte**: UNIQUE(chantier_id, entreprise_id).

### Visite

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| chantier_id | UUID | FK → Chantier.id, NOT NULL | Chantier inspecte |
| phase_id | UUID | FK → Phase.id, NOT NULL | Phase evaluee |
| inspecteur_nom | TEXT | NOT NULL | Nom de l'inspecteur |
| inspecteur_id | UUID | NULLABLE, FK → auth.users.id | User Supabase (si auth) |
| date_visite | TIMESTAMPTZ | NOT NULL, default now() | Date et heure de la visite |
| statut | TEXT | NOT NULL, CHECK('en_cours','terminee'), default 'en_cours' | Statut |
| notes | TEXT | NULLABLE | Notes generales de visite |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Date de creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Derniere modification |

### ReponseVisite

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| visite_id | UUID | FK → Visite.id, NOT NULL | Visite parente |
| checklist_item_id | UUID | FK → ChecklistItem.id, NOT NULL | Point de controle |
| resultat | TEXT | NOT NULL, CHECK('conforme','non_conforme','non_applicable') | Reponse |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Date de creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Derniere modification |

**Contrainte**: UNIQUE(visite_id, checklist_item_id).

### Ecart

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Identifiant unique |
| visite_id | UUID | FK → Visite.id, NOT NULL | Visite d'origine |
| checklist_item_id | UUID | FK → ChecklistItem.id, NOT NULL | Point de controle concerne |
| entreprise_id | UUID | FK → Entreprise.id, NULLABLE | Entreprise assignee |
| constat | TEXT | NOT NULL | Description du constat |
| photo_url | TEXT | NULLABLE | URL de la photo (Supabase Storage) |
| severite | TEXT | NOT NULL, CHECK('a_corriger','stop_danger'), default 'a_corriger' | Niveau de severite |
| statut | TEXT | NOT NULL, CHECK('a_corriger','stop_danger','resolu'), default 'a_corriger' | Statut courant |
| delai_resolution | DATE | NULLABLE | Date limite de correction |
| date_resolution | TIMESTAMPTZ | NULLABLE | Date effective de resolution |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Date de creation |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Derniere modification |

## State Machine: Ecart.statut

```
                    ┌─────────────┐
                    │ a_corriger  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            │            ▼
    ┌─────────────┐        │   ┌────────────┐
    │ stop_danger │        │   │   resolu   │ ← TERMINAL
    └──────┬──────┘        │   └────────────┘
           │               │            ▲
           ├───────────────┘            │
           │  (de-escalade)             │
           └────────────────────────────┘
              (resolution directe)
```

**Transitions valides**:
- `a_corriger` → `stop_danger` (escalade)
- `a_corriger` → `resolu` (resolution)
- `stop_danger` → `a_corriger` (de-escalade, danger immediat leve)
- `stop_danger` → `resolu` (resolution directe)
- `resolu` → (aucune transition, etat terminal)

## Indexes recommandes

```sql
CREATE INDEX idx_visite_chantier ON visite(chantier_id);
CREATE INDEX idx_visite_date ON visite(date_visite DESC);
CREATE INDEX idx_ecart_visite ON ecart(visite_id);
CREATE INDEX idx_ecart_statut ON ecart(statut) WHERE deleted_at IS NULL;
CREATE INDEX idx_ecart_delai ON ecart(delai_resolution)
  WHERE statut != 'resolu' AND deleted_at IS NULL;
CREATE INDEX idx_checklist_phase ON checklist_item(phase_id);
CREATE INDEX idx_chantier_statut ON chantier(statut) WHERE deleted_at IS NULL;
```

## Soft-Delete Convention

Toutes les entites mutables (Chantier, Entreprise, Visite, Ecart) ont un champ `deleted_at TIMESTAMPTZ NULLABLE`. Les entites de reference (Phase, ChecklistItem) n'ont pas de soft-delete (immuables).

Toutes les requetes DOIVENT filtrer `WHERE deleted_at IS NULL` par defaut. Supabase RLS policies DOIVENT inclure cette clause.
