# ClaudeCode Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-29

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
├── supabase/             # Migrations SQL (001-026) + seed.sql + config.toml
└── public/               # PWA: manifest.json, sw.js, icon.svg
```

## Key Architecture

- **Modèle multi-entreprise** : 1 entreprise → N inspecteurs (profiles.entreprise_id)
- **Sécurité env** : `src/lib/env.ts` — getters lazy, garde `requireServer()` côté client
- **PWA offline** : Service Worker (network-first pages, cache-first assets), IndexedDB local-first autosave, sync auto au retour réseau
- **Dashboard** : `/dashboard` — KPI personnalisés par inspecteur (RLS), graphique NC, chantiers urgents, liste visites du mois cliquable
- **Email** : Signature dynamique depuis données entreprise, envoi multi-destinataires en une requête Resend
- **Checklist visite** : Sélection de points dégroupée (liste plate), ajout de thèmes en cours de visite sans perte des points existants, recherche globale par mot-clé (catégories + thèmes) avec debounce
- **Données** : 26 catégories, 442 thèmes, 447 points de contrôle (migration 025, source Excel)

## Security

- **RLS** : Activée sur toutes les tables. Documents scopés par chantier. Themes/base_documentaire/point_controle_documents en lecture seule pour non-admins. Profiles bloqué sur modification rôle/entreprise_id.
- **Storage RLS** : Policies sur buckets `rapports` et `visite-photos` (suppression scopée par chantier/admin)
- **CSP** : Content-Security-Policy stricte dans `next.config.ts` (frame-ancestors none, connect-src Supabase, frame-src Supabase pour aperçu PDF)
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
npx supabase db seed # Charger les données de référence
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
- 2026-03-28: Modèle freemium (Stripe), aperçu PDF (CSP frame-src), envoi email multi-destinataires, copyright footer
- 2026-03-29: Import 447 points de contrôle depuis Excel (migrations 025-026), correction chargement catégories (retrait filtre phase_id IS NULL, fix RLS), dashboard visites du mois cliquable, sélection points dégroupée, ajout thèmes sans perte de points existants
- 2026-04-07: Recherche globale par mot-clé (catégories + thèmes) sur nouvelle visite et ajout en cours de visite, bouton "+ Catégories/Thèmes" déplacé en bas de checklist
- 2026-04-08: Audit sécurité complet v2 — trigger PostgreSQL anti-modification rôle (migration 027), autorisation écarts/statut + photos/analyze, fix bypass export XLSX, prompt injection mitigation (balises XML), Content-Length limits sur fetch, sender name sanitization, audit logging étendu (email envoi, écart statut), rate limiter anti-memory-exhaustion, validation scope export, upgrade Anthropic SDK
- 2026-04-15: Remarques générales visite (migration 028, champ textarea + section PDF), suppression visite en cours (API DELETE /api/visites/[id] + DeleteVisiteButton avec confirmation, audit log), bouton « Remarques » (orange) dans checklist (migration 029, valeur 'remarques' dans contrainte CHECK), section Remarques dans PDF (fond ambre/bordure orange), fix type TS valeur reponses
- 2026-04-28: Déploiement VPS Hostinger (31.97.36.92) — Docker Compose, Nginx reverse proxy, Cloudflare Flexible SSL. Fix NEXT_PUBLIC_APP_URL (https://ton-domaine.com → https://chantiers.securionis.com), rebuild container (résolution erreurs "Failed to find Server Action"), Supabase Auth URL Configuration mise à jour (Site URL + Redirect URLs). Commande de mise à jour : cd /app/securionis && docker compose up --build -d
