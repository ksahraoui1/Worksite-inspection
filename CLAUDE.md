# ClaudeCode Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-22

## Active Technologies

- TypeScript 5.x + Next.js 16 (App Router), Tailwind CSS 4.x, @supabase/supabase-js, @supabase/ssr, @react-pdf/renderer, Resend (email)

## Project Structure

```text
securionis-chantiers/
├── src/app/              # Pages et API routes (Next.js App Router)
│   ├── (auth)/           #   Login
│   ├── (dashboard)/      #   Dashboard, chantiers, admin
│   │   ├── dashboard/    #     Vue d'ensemble inspecteur (KPI, graphique NC)
│   │   ├── chantiers/    #     CRUD chantiers, visites, rapports
│   │   └── admin/        #     Points de contrôle, utilisateurs, entreprise
│   └── api/              #   Routes API (PDF, email, écarts, create-user)
├── src/components/       # Composants React (chantier, visite, ecart, admin, pdf, ui)
├── src/lib/              # Supabase clients, email, env, utilitaires
│   ├── offline/          #   IndexedDB store + sync (PWA offline)
│   └── email/            #   Envoi de rapports (signature dynamique par entreprise)
├── src/hooks/            # Hooks React (autosave offline, photo-upload, online-status)
├── src/types/            # Types TypeScript (database.ts — profiles, entreprises, etc.)
├── supabase/             # Migrations SQL (001-015) + seed.sql + config.toml
└── public/               # PWA: manifest.json, sw.js, icon.svg
```

## Key Architecture

- **Modèle multi-entreprise** : 1 entreprise → N inspecteurs (profiles.entreprise_id)
- **Sécurité env** : `src/lib/env.ts` — getters lazy, garde `requireServer()` côté client
- **PWA offline** : Service Worker (network-first pages, cache-first assets), IndexedDB local-first autosave, sync auto au retour réseau
- **Dashboard** : `/dashboard` — KPI personnalisés par inspecteur (RLS), graphique NC, chantiers urgents
- **Email** : Signature dynamique depuis données entreprise (plus de hardcode)

## Commands

```bash
cd securionis-chantiers
npm run dev          # Serveur de développement
npm run build        # Build production
npm run lint         # Linting ESLint
npx supabase db push # Appliquer les migrations
npx supabase db seed # Charger les données SUVA
```

## Code Style

TypeScript 5.x: Follow standard conventions
- Composants : PascalCase, un fichier par composant
- Hooks : camelCase préfixé use-
- "use client" uniquement pour les composants interactifs
- Server Components par défaut pour les pages
- Min 44x44px pour tous les éléments tactiles (tablette)
- Variables d'env : toujours via `src/lib/env.ts`, jamais `process.env!` directement

## Constitution

Voir `.specify/memory/constitution.md` (v1.1.0) pour les 8 principes directeurs.

## Recent Changes

- 002-securionis-chantiers: Implemented full SST inspection app (66 source files, 11 migrations, 15 pages, build OK)
- 2026-03-22: Sécurisation clés API (env.ts), dashboard inspecteur, PWA offline (SW + IndexedDB), relation inspecteur-entreprise, email dynamique
