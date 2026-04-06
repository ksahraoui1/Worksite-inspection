# Data Model: SST-QuickRef

**Feature**: 001-sst-quickref-assistant  
**Date**: 2026-04-02

## Entities

### 1. documents_sst

Stocke les chunks de textes réglementaires avec leurs embeddings vectoriels.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique du chunk |
| content | TEXT | NOT NULL | Texte brut du chunk réglementaire |
| embedding | vector(1536) | NOT NULL | Vecteur text-embedding-3-small |
| source | TEXT | NOT NULL | Source législative (ex: 'OTConst', 'CFST_6508', 'OPA') |
| article | TEXT | | Référence de l'article (ex: 'Art. 47', 'Chap. 3 §2') |
| version_date | DATE | NOT NULL | Date de la version du texte source |
| source_url | TEXT | | URL officielle du document source |
| is_superseded | BOOLEAN | DEFAULT false | True si remplacé par une version plus récente |
| sha256_hash | TEXT | NOT NULL | Hash SHA-256 du contenu pour traçabilité d'intégrité |
| language | TEXT | DEFAULT 'fr' | Langue du chunk ('fr', 'de', 'it') |
| created_at | TIMESTAMPTZ | DEFAULT now() | Date d'insertion |

**Index**: HNSW sur `embedding` avec opérateur cosinus pour recherche vectorielle performante.  
**Filtre par défaut**: `is_superseded = false` dans toutes les requêtes de recherche.  
**Unicité**: Combinaison `sha256_hash` + `source` + `article` + `version_date` empêche les doublons.

### 2. quickref_queries

Logs anonymisés des requêtes pour amélioration continue et métriques.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique de la requête |
| question | TEXT | NOT NULL | Question posée (anonymisée, sans données personnelles) |
| sources_used | TEXT[] | | Array des source:article citées dans la réponse |
| response_ms | INTEGER | | Temps de réponse en millisecondes |
| user_type | TEXT | NOT NULL | 'inspector', 'admin', 'anonymous' |
| similarity_score | FLOAT | | Score de similarité cosinus du top chunk retourné |
| was_refused | BOOLEAN | DEFAULT false | True si la réponse a été refusée (score < seuil) |
| created_at | TIMESTAMPTZ | DEFAULT now() | Date de la requête |

**Rétention**: Suppression automatique après 90 jours (pg_cron ou politique applicative).  
**Anonymisation**: Appliquée côté Edge Function avant insertion.

### 3. quickref_feedback

Feedback utilisateur sur les réponses (pouce haut/bas).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| query_id | UUID | FK → quickref_queries.id | Requête associée |
| rating | TEXT | NOT NULL, CHECK IN ('up', 'down') | Pouce haut ou bas |
| created_at | TIMESTAMPTZ | DEFAULT now() | Date du feedback |

**Contrainte**: Un seul feedback par query_id (UNIQUE sur query_id).

## Relationships

```text
documents_sst (standalone — pas de FK, interrogé par recherche vectorielle)

quickref_queries 1 ←→ 0..1 quickref_feedback
```

## State Transitions

### Document réglementaire (chunk)

```text
[Ingéré] → is_superseded = false (version courante)
         → [Mise à jour détectée] → is_superseded = true (version antérieure)
                                   → Nouveau chunk inséré avec is_superseded = false
```

### Requête

```text
[Reçue] → [Embedding calculé] → [Recherche vectorielle]
        → score >= seuil → [Génération réponse Claude] → [Réponse affichée]
        → score < seuil  → [Refus affiché: "Aucun texte trouvé"]
        → [Log anonymisé inséré dans quickref_queries]
```

## RLS Policies

- `documents_sst`: SELECT pour tous les utilisateurs authentifiés + anonymous (lecture seule). INSERT/UPDATE/DELETE réservé aux admins.
- `quickref_queries`: INSERT pour tous (via Edge Function service role). SELECT réservé aux admins.
- `quickref_feedback`: INSERT pour tous les utilisateurs authentifiés. SELECT réservé aux admins.

## Volume Estimates

- **documents_sst**: ~450 chunks pour Priorité 1 (OTConst ~300, CFST 6508 ~100, OPA ~50). Extensible à ~2000 chunks pour Priorité 1-3.
- **quickref_queries**: ~1000 lignes/mois (cible), nettoyées à 90 jours → max ~3000 lignes.
- **quickref_feedback**: ~5-10% des requêtes → ~100-300 lignes actives.
