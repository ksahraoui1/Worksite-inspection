# SST-QuickRef Development Guidelines

Last updated: 2026-04-06

## Production

- **URL** : https://quickref.securionis.com
- **Hébergement** : VPS Hostinger (Docker + Nginx), SSL Let's Encrypt
- **Backend** : Supabase Edge Functions (projet wixcqdyoqxdgqeqqmfqu)
- **Corpus** : 39 sources, 4480 chunks de textes réglementaires suisses (3 directives CFST manquantes : 1907, 2135, 2314)

## Active Technologies

- **Frontend** : Vue 3 + Vite + Tailwind CSS 4 (SPA)
- **Backend** : Supabase Edge Functions (Deno), PostgreSQL + pgvector
- **IA** : Claude Sonnet (Anthropic API) pour génération de réponses, OpenAI text-embedding-3-small pour embeddings
- **Ingestion** : TypeScript scripts (tsx), unpdf pour extraction PDF

## Project Structure

```text
sst-quickref/
├── frontend/                    # Vue 3 SPA (landing page + chat)
│   ├── src/
│   │   ├── components/          # ChatWindow, MessageBubble, SourceCard, FeedbackButton, DisclaimerBanner
│   │   ├── composables/         # useChat, useOfflineCache, useRateLimit, useOnlineStatus
│   │   ├── pages/               # LandingPage, ChatPage
│   │   ├── services/            # quickref-api.ts (appels Supabase Edge Functions)
│   │   └── types/               # Types TypeScript (QuickRefResponse, ChatMessage, etc.)
│   └── .env.production          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── supabase/
│   ├── functions/
│   │   ├── quickref-query/      # Edge Function RAG (embedding → pgvector → Claude → réponse sourcée)
│   │   └── quickref-feedback/   # Edge Function feedback (pouce haut/bas)
│   └── migrations/              # 5 migrations SQL (pgvector, tables, RPC, RLS, retention)
├── scripts/ingest/              # Pipeline d'ingestion PDF → chunks → embeddings → Supabase
│   ├── documents-registry.ts    # Registre des 39 sources (métadonnées, URLs fedlex)
│   ├── download-all.ts          # Téléchargement auto via SPARQL fedlex API
│   ├── parse-otconst.ts         # + parse-cfst6508.ts, parse-opa.ts, parse-olt1-4.ts
│   ├── parse-generic.ts         # Parser générique (lois, ordonnances, directives)
│   ├── parse-pdf.ts             # Utilitaire commun extraction PDF (unpdf)
│   ├── chunk.ts                 # Découpage sémantique par article (max 512 tokens)
│   ├── embed.ts                 # OpenAI text-embedding-3-small
│   ├── upload.ts                # Upload Supabase avec SHA-256
│   └── run-all.ts               # Orchestrateur complet
├── data/                        # PDFs réglementaires (37 fichiers : lois, ordonnances, directives CFST, ESTI)
├── tests/benchmark/             # 50 questions de référence (questions.json)
├── scripts/validate/            # run-benchmark.ts
├── deploy/                      # nginx.conf + deploy.sh pour VPS
└── specs/                       # Spécifications complètes (spec, plan, research, data-model, contracts, tasks)
```

## Commands

```bash
# Frontend
cd frontend && npm run dev       # Serveur de développement (localhost:5173)
cd frontend && npx vite build    # Build production

# Ingestion
npx tsx scripts/ingest/run-all.ts   # Ingérer tous les PDFs réglementaires

# Benchmark
npx tsx scripts/validate/run-benchmark.ts  # Valider sur 50 questions

# Déploiement Edge Functions
supabase functions deploy quickref-query --no-verify-jwt
supabase functions deploy quickref-feedback --no-verify-jwt

# Déploiement VPS (depuis le VPS)
cd /tmp/sst-quickref/sst-quickref/frontend && npm install && npx vite build && cp -r dist/* /app/quickref/ && docker exec securionis-nginx-1 nginx -s reload
```

## Key Architecture

- **RAG Pipeline** : question → embedding (OpenAI) → recherche vectorielle pgvector top-5 → seuil 0.55 → prompt Claude Sonnet avec contexte → réponse sourcée avec citations
- **39 sources réglementaires** (~4480 chunks) : 7 originales (OTConst, CFST 6508, OPA, OLT1-4) + 32 nouvelles (6 lois: LAA/LChim/LRS/LEg/LSPS/LIE, 11 ordonnances: OLT5/OChim/OPB/ORRChim/OICF/OIBT/OPair/OSPS/OMAle/OSEC/OPI, 14 directives CFST + ESTI 407, 2 articles de code: CO 328/CP 229)
- **Ingestion** : `documents-registry.ts` (registre), `parse-generic.ts` (parser générique), `download-all.ts` (téléchargement SPARQL fedlex)
- **Rate limiting** : 10 req/jour pour anonymes (IP-based), illimité pour admin (header x-admin-key)
- **Disclaimer** : Affiché sur chaque réponse, SST-QuickRef n'est pas un avis juridique
- **Offline** : Cache IndexedDB des 50 dernières réponses

## Security (Audit 2026-04-04)

- **CORS** : Restreint à quickref.securionis.com + localhost:5173 (plus de wildcard)
- **Validation** : validate.ts — question max 500 chars, context sanitisé (alphanumeric), langue vérifiée
- **Rate limiting** : rate-limit.ts — 10 req/jour par IP (in-memory), bypass admin via x-admin-key
- **Admin key** : Comparaison constant-time (anti timing attack), QUICKREF_ADMIN_KEY dans Supabase secrets
- **Anonymisation** : anonymize.ts — suppression PII (emails, téléphones, noms, adresses, entreprises suisses) avant logging
- **Prompt injection** : Question encadrée par `<user_question>`, instruction de sécurité dans system prompt
- **Client séparé** : anon key pour lectures (respecte RLS), service role uniquement pour INSERT logs
- **RLS** : Activée sur toutes les tables (documents_sst SELECT all, quickref_queries INSERT service role, feedback INSERT auth)
- **Intégrité** : SHA-256 hash sur chaque chunk pour traçabilité légale
- **Nginx** : HSTS, CSP (base-uri, form-action), Permissions-Policy, X-Frame-Options DENY
- **Source maps** : Désactivées en production
- **Dépendance** : @supabase/supabase-js@2.49.4 pinnée

## Recent Changes

- 2026-04-02 : Création projet complet (50 tâches, 60 fichiers source)
- 2026-04-03 : Ingestion vrais PDFs réglementaires (411 → 971 chunks avec OLT1-4)
- 2026-04-03 : Déploiement production https://quickref.securionis.com (VPS Docker + Nginx + SSL)
- 2026-04-03 : Accès admin Pro avec clé secrète, bypass rate limit
- 2026-04-03 : Fix CORS, responsive mobile, suppression "[URL non fournie]" des citations
- 2026-04-03 : System prompt langage naturel (questions informelles)
- 2026-04-03 : Layout chat responsive (disclaimer inline, input toujours visible)
- 2026-04-03 : Branding ©2026 - Securionis, section CTA Plan Pro masquée provisoirement
- 2026-04-04 : Audit sécurité complet — 22 vulnérabilités corrigées (CORS, rate-limit, anonymize, prompt injection, timing attack, HSTS, CSP)
- 2026-04-05 : Abonnement Stripe Plan Pro CHF 29/mois (checkout, webhook, table subscriptions)
- 2026-04-05 : Authentification magic link via Supabase Auth
- 2026-04-05 : Session unique par abonné (1 seul appareil simultané, bannière si révoquée)
- 2026-04-06 : Expansion corpus RAG — 32 nouvelles sources (971 → ~4480 chunks), téléchargement auto via SPARQL fedlex, parser générique
