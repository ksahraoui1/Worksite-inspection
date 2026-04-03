# SST-QuickRef Development Guidelines

Last updated: 2026-04-03

## Production

- **URL** : https://quickref.securionis.com
- **Hébergement** : VPS Hostinger (Docker + Nginx), SSL Let's Encrypt
- **Backend** : Supabase Edge Functions (projet wixcqdyoqxdgqeqqmfqu)
- **Corpus** : 7 sources, 971 chunks, 198 pages de textes réglementaires suisses

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
│   ├── parse-otconst.ts         # + parse-cfst6508.ts, parse-opa.ts, parse-olt1-4.ts
│   ├── parse-pdf.ts             # Utilitaire commun extraction PDF (unpdf)
│   ├── chunk.ts                 # Découpage sémantique par article (max 512 tokens)
│   ├── embed.ts                 # OpenAI text-embedding-3-small
│   ├── upload.ts                # Upload Supabase avec SHA-256
│   └── run-all.ts               # Orchestrateur complet
├── data/                        # PDFs réglementaires (otconst, opa, cfst6508, olt1-4)
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
- **7 sources réglementaires** : OTConst (160 chunks), CFST 6508 (44), OPA (207), OLT1 (252), OLT2 (188), OLT3 (48), OLT4 (72)
- **Rate limiting** : 10 req/jour pour anonymes (IP-based), illimité pour admin (header x-admin-key)
- **Disclaimer** : Affiché sur chaque réponse, SST-QuickRef n'est pas un avis juridique
- **Offline** : Cache IndexedDB des 50 dernières réponses

## Security

- **CORS** : Headers Access-Control-Allow-Origin: * sur Edge Functions
- **Admin key** : QUICKREF_ADMIN_KEY dans Supabase secrets, vérifié via header x-admin-key
- **RLS** : Activée sur toutes les tables (documents_sst, quickref_queries, quickref_feedback)
- **Anonymisation** : Regex suppression noms propres suisses avant logging
- **Intégrité** : SHA-256 hash sur chaque chunk pour traçabilité légale

## Recent Changes

- 2026-04-02 : Création projet complet (50 tâches, 60 fichiers source)
- 2026-04-03 : Ingestion vrais PDFs réglementaires (411 → 971 chunks avec OLT1-4)
- 2026-04-03 : Déploiement production https://quickref.securionis.com (VPS Docker + Nginx + SSL)
- 2026-04-03 : Accès admin Pro avec clé secrète, bypass rate limit
- 2026-04-03 : Fix CORS, responsive mobile, suppression "[URL non fournie]" des citations
- 2026-04-03 : System prompt langage naturel (questions informelles)
- 2026-04-03 : Layout chat responsive (disclaimer inline, input toujours visible)
- 2026-04-03 : Branding ©2026 - Securionis, section CTA Plan Pro masquée provisoirement
