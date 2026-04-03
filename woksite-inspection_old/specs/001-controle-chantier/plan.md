# Implementation Plan: Controle Chantier

**Branch**: `001-controle-chantier` | **Date**: 2026-02-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-controle-chantier/spec.md`

## Summary

Application web Mobile-First PWA pour la gestion de la securite sur les chantiers de construction en Suisse, conforme OTConst/SUVA. Dashboard chantiers, module d'inspection avec checklists dynamiques par phase de construction, documentation des ecarts avec photo, bouton STOP Danger, generation de rapports PDF. Mode hors-ligne obligatoire avec synchronisation automatique.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, Supabase JS v2, Tailwind CSS, @react-pdf/renderer v4, Serwist, Dexie.js 4.x, Resend
**Storage**: PostgreSQL via Supabase + IndexedDB via Dexie.js (offline)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web PWA (Mobile-First: iOS Safari, Android Chrome, desktop)
**Project Type**: web-app (PWA)
**Performance Goals**: Dashboard <2s, visite complete <10min, notification STOP <30s
**Constraints**: Offline-capable, mobile 360px min, conservation 10 ans
**Scale/Scope**: 50 chantiers actifs, 10 users simultanes, ~15 ecrans

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Statut | Verification |
|----------|--------|-------------|
| I. Conformite OTConst/SUVA | PASS | Toutes les ChecklistItems ont reference_legale NOT NULL. Seed contient les 5 phases avec refs OTConst Art. 4/26/61/68 et SUVA. |
| II. Mobile-First et Usage Terrain | PASS | Tailwind mobile-first, breakpoints 360/768/1024, boutons 44px min, PWA Serwist + Dexie.js offline, capture photo integree. |
| III. Tracabilite Chronologique | PASS | Soft-delete sur toutes entites mutables, historique chronologique par chantier, rapports PDF horodates, conservation 10 ans. |
| IV. Securite Immediate STOP Danger | PASS | Bouton rouge persistant dans layout.tsx, API route dediee, notification email Resend, state machine avec protection. |
| V. Architecture par Phases | PASS | 5 phases en donnees de reference, checklists dynamiques par phase_id, seed complet. |

**Aucune violation. Gate PASS.**

## Project Structure

### Documentation (this feature)

```text
specs/001-controle-chantier/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-routes.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                          # Layout global + bouton STOP Danger
│   ├── page.tsx                            # Dashboard (liste chantiers + alertes)
│   ├── globals.css                         # Tailwind base
│   ├── sw.ts                               # Service Worker Serwist
│   ├── chantiers/
│   │   ├── page.tsx                        # Liste chantiers
│   │   ├── nouveau/page.tsx                # Formulaire creation chantier
│   │   └── [id]/
│   │       ├── page.tsx                    # Detail chantier + timeline visites
│   │       ├── entreprises/page.tsx        # Gestion entreprises du chantier
│   │       └── visites/
│   │           ├── nouvelle/page.tsx       # Selection phase + creation visite
│   │           └── [visiteId]/
│   │               ├── page.tsx            # Formulaire inspection (checklist)
│   │               └── rapport/page.tsx    # Vue rapport + generation PDF
│   └── api/
│       ├── ecarts/
│       │   ├── stop-danger/route.ts        # POST: STOP Danger + notification
│       │   └── [id]/
│       │       └── transition/route.ts     # PATCH: transition statut ecart
│       ├── visites/
│       │   └── [id]/
│       │       └── pdf/route.ts            # POST: generation PDF
│       └── notifications/
│           └── stop-danger/route.ts        # POST: envoi email Resend
├── components/
│   ├── ui/                                 # Boutons, cards, badges, modals
│   ├── dashboard/
│   │   ├── chantier-card.tsx               # Card chantier avec badge alertes
│   │   └── alertes-banner.tsx              # Banniere ecarts en retard
│   ├── inspection/
│   │   ├── checklist-form.tsx              # Formulaire checklist
│   │   ├── checklist-item.tsx              # Item individuel (C/NC/NA)
│   │   └── phase-selector.tsx              # Selection de phase
│   ├── ecart/
│   │   ├── ecart-form.tsx                  # Creation ecart (photo+note+assign)
│   │   ├── ecart-list.tsx                  # Liste ecarts filtrables
│   │   └── photo-capture.tsx               # Capture photo camera
│   ├── stop-danger/
│   │   ├── stop-button.tsx                 # Bouton rouge persistant
│   │   └── stop-modal.tsx                  # Modal formulaire rapide
│   ├── chantier/
│   │   ├── chantier-form.tsx               # Formulaire CRUD chantier
│   │   └── timeline-visites.tsx            # Timeline chronologique
│   └── pdf/
│       └── rapport-visite.tsx              # Template PDF @react-pdf/renderer
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Client browser
│   │   ├── server.ts                       # Client server-side
│   │   └── middleware.ts                   # Auth middleware
│   ├── dexie/
│   │   └── db.ts                           # Schema IndexedDB offline
│   ├── sync/
│   │   └── sync-manager.ts                # Sync offline → Supabase
│   ├── notifications/
│   │   └── email.ts                        # Integration Resend
│   └── utils/
│       ├── ecart-state.ts                  # State machine ecart
│       └── photo-compress.ts               # Compression photo mobile
├── types/
│   └── database.ts                         # Types generes Supabase
└── hooks/
    ├── use-online-status.ts                # Detection connexion
    └── use-sync.ts                         # Hook synchronisation
supabase/
├── migrations/
│   ├── 001_create_phases.sql
│   ├── 002_create_checklist_items.sql
│   ├── 003_create_chantiers.sql
│   ├── 004_create_entreprises.sql
│   ├── 005_create_visites.sql
│   ├── 006_create_reponses_ecarts.sql
│   └── 007_create_rls_policies.sql
├── seed.sql                                # Phases + checklist items OTConst/SUVA
└── config.toml
public/
├── sw.js                                   # Service Worker output
└── manifest.json                           # PWA manifest
tests/
├── unit/
│   ├── ecart-state.test.ts                 # Tests state machine
│   └── photo-compress.test.ts
└── integration/
    ├── inspection-flow.test.ts
    └── stop-danger.test.ts
```

**Structure Decision**: Next.js App Router (single project) avec dossier `supabase/` pour les migrations et le seed. Pas de separation frontend/backend car Next.js gere les deux via App Router + API Routes.

## Complexity Tracking

> Aucune violation de constitution detectee. Pas de complexite a justifier.
