# ClaudeCode Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-27

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
│   └── api/              #   Routes API (PDF, email, écarts, create-user, assistant, export)
├── src/components/       # Composants React (chantier, visite, ecart, admin, pdf, ui)
├── src/lib/              # Supabase clients, email, env, utilitaires
│   ├── offline/          #   IndexedDB store + sync (PWA offline)
│   ├── email/            #   Envoi de rapports (signature dynamique par entreprise)
│   └── utils/            #   Security, file-validation, constants, photo-compress
├── src/hooks/            # Hooks React (autosave offline, photo-upload, online-status)
├── src/types/            # Types TypeScript (database.ts — profiles, entreprises, audit_logs, etc.)
├── supabase/             # Migrations SQL (001-023) + seed.sql + config.toml
└── public/               # PWA: manifest.json, sw.js, icon.svg
```

## Key Architecture

- **Modèle multi-entreprise** : 1 entreprise → N inspecteurs (profiles.entreprise_id)
- **Sécurité env** : `src/lib/env.ts` — getters lazy, garde `requireServer()` côté client
- **PWA offline** : Service Worker (network-first pages, cache-first assets), IndexedDB local-first autosave, sync auto au retour réseau
- **Dashboard** : `/dashboard` — KPI personnalisés par inspecteur (RLS), graphique NC, chantiers urgents
- **Email** : Signature dynamique depuis données entreprise (plus de hardcode)

## Security

- **RLS** : Activée sur toutes les tables. Documents scopés par chantier. Themes/base_documentaire/point_controle_documents en lecture seule pour non-admins. Profiles bloqué sur modification rôle/entreprise_id.
- **Storage RLS** : Policies sur buckets `rapports` et `visite-photos` (suppression scopée par chantier/admin)
- **CSP** : Content-Security-Policy stricte dans `next.config.ts` (frame-ancestors none, connect-src Supabase uniquement)
- **Autorisation API** : `canAccessVisite()`, `canAccessChantier()` dans `src/lib/utils/security.ts` — vérification propriété sur toutes les routes API
- **SSRF** : `isAllowedSupabaseUrl()` — whitelist stricte hostname exact du projet Supabase
- **XSS** : `escapeHtml()` dans tous les templates email ; React échappe nativement côté client ; pas de SVG upload
- **Upload** : `src/lib/utils/file-validation.ts` — whitelist extensions, validation MIME, taille max (50 Mo docs, 10 Mo images)
- **Rate limiting** : In-memory (`src/lib/rate-limit.ts`) sur toutes les routes sensibles (IA, email, export, create-user)
- **Admin guard** : `src/app/(dashboard)/admin/layout.tsx` — Server Component qui redirige si non-admin
- **Audit** : Table `audit_logs` pour traçabilité des actions sensibles
- **Middleware** : Exact path match pour routes publiques (anti-bypass)

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
- Sécurité : toujours via `src/lib/utils/security.ts` pour auth checks, `src/lib/utils/file-validation.ts` pour uploads

## Recent Changes

- 002-securionis-chantiers: Implemented full SST inspection app (66 source files, 11 migrations, 15 pages, build OK)
- 2026-03-22: Sécurisation clés API (env.ts), dashboard inspecteur, PWA offline (SW + IndexedDB), relation inspecteur-entreprise, email dynamique
- 2026-03-27: Audit sécurité complet — RLS renforcée (migrations 022-023), CSP, autorisation API, SSRF whitelist stricte, XSS emails, validation uploads, admin guard, Storage RLS, anti-énumération comptes, bloquer modification rôle, rate limiting, audit logging, prompt injection mitigation
