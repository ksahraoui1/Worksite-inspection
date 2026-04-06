# Implementation Plan: SST-QuickRef — Assistant IA Réglementaire

**Branch**: `001-sst-quickref-assistant` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-sst-quickref-assistant/spec.md`

## Summary

SST-QuickRef est un assistant IA juridique spécialisé dans la réglementation SST suisse pour les chantiers de construction. Il utilise une architecture RAG (Retrieval-Augmented Generation) combinant recherche vectorielle (Supabase pgvector) et génération de réponses sourcées (Claude Sonnet) pour fournir des citations réglementaires vérifiables en temps réel. Le périmètre couvre Phase 0 (POC RAG), Phase 1 (landing page chat Vue 3 + freemium) et Phase 2 (API REST + intégration Securionis Inspect).

## Technical Context

**Language/Version**: TypeScript 5.x (Edge Functions + ingestion scripts), Vue 3 + Vite (frontend landing page)
**Primary Dependencies**: Supabase (pgvector, Edge Functions, Storage, Auth), Anthropic Claude Sonnet API, OpenAI text-embedding-3-small, Resend (notifications), Vue 3 + Vite + Tailwind CSS
**Storage**: Supabase PostgreSQL avec extension pgvector (table documents_sst, quickref_queries)
**Testing**: Vitest (frontend), Deno test (Edge Functions), jeu de 50 questions de référence validées manuellement
**Target Platform**: Web (navigateurs modernes), intégration API REST dans Securionis Inspect (Next.js)
**Project Type**: Web service (RAG backend) + SPA (landing page chat) + API REST
**Performance Goals**: < 3 secondes par requête, 1000 req/mois, 99,5% disponibilité heures ouvrées
**Constraints**: Français uniquement (Phase 1-2), conformité nLPD/RGPD, anonymisation logs, < CHF 5/mois coûts API à 1000 req/mois
**Scale/Scope**: ~450 chunks documentaires (Priorité 1), 3 sources réglementaires, extensible à 8+ sources

## Constitution Check

*GATE: Aucune constitution définie (`.specify/memory/constitution.md` absent). Aucun gate bloquant.*

Recommandation : créer une constitution via `/speckit.constitution` pour les futures features.

## Project Structure

### Documentation (this feature)

```text
specs/001-sst-quickref-assistant/
├── plan.md              # Ce fichier
├── research.md          # Phase 0 — recherche et décisions techniques
├── data-model.md        # Phase 1 — modèle de données
├── quickstart.md        # Phase 1 — guide de démarrage rapide
├── contracts/           # Phase 1 — contrats d'API
│   └── api-quickref-query.md
└── tasks.md             # Phase 2 — tâches (via /speckit.tasks)
```

### Source Code (repository root)

```text
sst-quickref/
├── frontend/                    # Landing page + chat (Vue 3 + Vite)
│   ├── src/
│   │   ├── components/          # ChatWindow, MessageBubble, SourceCard, FeedbackButton, DisclaimerBanner
│   │   ├── composables/         # useChat, useOfflineCache, useRateLimit
│   │   ├── pages/               # LandingPage, ChatPage
│   │   ├── services/            # quickref-api.ts, embedding.ts
│   │   ├── stores/              # chat.ts, auth.ts
│   │   └── types/               # index.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── supabase/
│   ├── functions/
│   │   ├── quickref-query/      # Edge Function — orchestration RAG
│   │   ├── quickref-ingest/     # Edge Function — ingestion de documents
│   │   └── quickref-feedback/   # Edge Function — enregistrement feedback
│   ├── migrations/
│   │   ├── 001_documents_sst.sql
│   │   ├── 002_quickref_queries.sql
│   │   ├── 003_quickref_feedback.sql
│   │   └── 004_rls_policies.sql
│   └── config.toml
│
├── scripts/
│   ├── ingest/                  # Scripts d'ingestion des textes réglementaires
│   │   ├── parse-otconst.ts     # Parser OTConst
│   │   ├── parse-cfst6508.ts    # Parser CFST 6508
│   │   ├── parse-opa.ts         # Parser OPA Art. 62
│   │   ├── chunk.ts             # Découpage sémantique
│   │   ├── embed.ts             # Embedding via text-embedding-3-small
│   │   └── upload.ts            # Upload vers Supabase
│   └── validate/
│       └── run-benchmark.ts     # Validation sur 50 questions de référence
│
├── tests/
│   ├── unit/                    # Tests unitaires (chunking, parsing, scoring)
│   ├── integration/             # Tests d'intégration (RAG pipeline end-to-end)
│   └── benchmark/               # Questions de référence + expected outputs
│       └── questions.json
│
└── docs/
    └── disclaimer.md            # Texte du disclaimer légal
```

**Structure Decision**: Architecture séparée frontend (Vue 3 SPA) / backend (Supabase Edge Functions) / scripts d'ingestion. Le frontend est un SPA autonome déployable indépendamment. Le backend utilise exclusivement les Edge Functions Supabase pour minimiser l'infrastructure. Les scripts d'ingestion sont des CLI TypeScript exécutés manuellement ou en CI.

## Complexity Tracking

Aucune violation de constitution à justifier (pas de constitution définie).
