# SST-QuickRef – Guide de Développement & Documentation

**Dernière mise à jour:** 28 avril 2026
**Responsable:** Karim Aigle (ks.aigle@gmail.com)
**Statut:** Production active — déployé sur VPS Hostinger

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture & Flux de données](#architecture--flux-de-données)
3. [Environnement de développement](#environnement-de-développement)
4. [Structure du projet](#structure-du-projet)
5. [Commandes principales](#commandes-principales)
6. [Production & Déploiement](#production--déploiement)
7. [Sécurité](#sécurité)
8. [Corpus réglementaire](#corpus-réglementaire)
9. [Historique des changements](#historique-des-changements)
10. [Roadmap & Tâches en attente](#roadmap--tâches-en-attente)

---

## Vue d'ensemble

**SST-QuickRef** est un assistant IA alimenté par RAG (Retrieval-Augmented Generation) spécialisé dans la **santé et sécurité au travail (SST)** en Suisse.

### Caractéristiques principales
- **Chat conversationnel** avec base réglementaire suisse (39 sources, ~4480 chunks)
- **RAG pipeline** : vectorisation → recherche sémantique → génération avec Claude Sonnet
- **Rate limiting** : 10 req/jour pour anonymes, illimité pour abonnés Pro
- **Sécurité renforcée** : audit complet (avril 2026), anonymisation PII, RLS, HSTS/CSP
- **Authentification** : Magic link Supabase + abonnement Stripe (CHF 29/mois)
- **Mode offline** : Cache IndexedDB des 50 dernières réponses

### Disclaimer systématique
> **SST-QuickRef n'est pas un avis juridique.** Chaque réponse affiche ce disclaimer. Pour des questions critiques, consulter un expert SST agréé.

---

## Architecture & Flux de données

### Diagramme logique

```
Question utilisateur
    ↓
[Frontend Vue 3] → Validation + rate-limit local
    ↓
[Supabase Edge Function: quickref-query]
    ├─ 1. Embedding (OpenAI text-embedding-3-small)
    ├─ 2. Recherche vectorielle pgvector (top-5, seuil 0.55)
    ├─ 3. Prompt Claude Sonnet + contexte
    ├─ 4. Génération réponse sourcée
    └─ 5. Logging anonymisé (anonymize.ts)
    ↓
[Supabase PostgreSQL]
    ├─ documents_sst (39 sources, 4480 chunks)
    ├─ quickref_queries (logs anonymisés)
    └─ feedback (pouce haut/bas)
    ↓
[Réponse au frontend] + Sources citées
```

### Composants clés

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Frontend** | Vue 3 + Vite + Tailwind 4 | SPA landing + chat |
| **Backend** | Supabase Edge Functions (Deno) | RAG, feedback, rate-limit |
| **IA Générative** | Claude Sonnet (Anthropic API) | Génération réponses |
| **Embeddings** | OpenAI text-embedding-3-small | Vectorisation corpus |
| **Base vectorielle** | PostgreSQL + pgvector | Stockage + recherche sémantique |
| **Authentification** | Supabase Auth + Stripe | Magic link + paiement |
| **Hébergement** | VPS Hostinger (Docker + Nginx) | Production |

---

## Environnement de développement

### Prérequis
```
Node.js 18+
npx (npm 7+)
Deno 1.40+
Docker (pour local Supabase si nécessaire)
```

### Variables d'environnement

**Frontend** (`.env.development`)
```env
VITE_SUPABASE_URL=https://wixcqdyoqxdgqeqqmfqu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Supabase Secrets** (via Supabase Dashboard)
```env
QUICKREF_ADMIN_KEY=<clé secrète 32+ caractères>
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Structure du projet

```
sst-quickref/
│
├── 📁 frontend/                          # Vue 3 SPA (landing + chat)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.vue           # Fenêtre chat principal
│   │   │   ├── MessageBubble.vue        # Bulle message (user/bot)
│   │   │   ├── SourceCard.vue           # Carte source citée
│   │   │   ├── FeedbackButton.vue       # Pouce haut/bas
│   │   │   └── DisclaimerBanner.vue     # Avertissement légal
│   │   ├── composables/
│   │   │   ├── useChat.ts               # Logique conversation
│   │   │   ├── useOfflineCache.ts       # Cache IndexedDB
│   │   │   ├── useRateLimit.ts          # Rate-limit client
│   │   │   └── useOnlineStatus.ts       # Détection connexion
│   │   ├── pages/
│   │   │   ├── LandingPage.vue          # Page d'accueil
│   │   │   └── ChatPage.vue             # Page chat
│   │   ├── services/
│   │   │   └── quickref-api.ts          # Appels Edge Functions
│   │   ├── types/
│   │   │   └── index.ts                 # Typage global (QuickRefResponse, etc.)
│   │   └── App.vue
│   ├── .env.development
│   ├── .env.production
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── 📁 supabase/                          # Backend (Edge Functions + migrations)
│   ├── functions/
│   │   ├── quickref-query/
│   │   │   ├── index.ts                 # Edge Function RAG principal
│   │   │   ├── validate.ts              # Validation question (max 500 chars, langue)
│   │   │   ├── rate-limit.ts            # Rate-limit IP-based (10 req/jour)
│   │   │   ├── anonymize.ts             # Suppression PII avant logging
│   │   │   └── deno.json
│   │   │
│   │   └── quickref-feedback/
│   │       ├── index.ts                 # Edge Function feedback (pouce)
│   │       └── deno.json
│   │
│   └── migrations/
│       ├── 20260403_001_pgvector.sql     # Extension pgvector
│       ├── 20260403_002_tables.sql       # documents_sst, quickref_queries, feedback, subscriptions
│       ├── 20260403_003_rpc.sql          # Fonctions PL/pgSQL utilitaires
│       ├── 20260404_004_rls.sql          # Row Level Security (RLS) sur tables
│       └── 20260405_005_retention.sql    # Nettoyage logs > 30 jours
│
├── 📁 scripts/ingest/                    # Pipeline d'ingestion PDF → Supabase
│   ├── documents-registry.ts             # Registre 39 sources (métadonnées, URLs fedlex)
│   ├── download-all.ts                   # Téléchargement auto via SPARQL fedlex
│   ├── parse-otconst.ts                  # Parser spécialisé OTConst
│   ├── parse-cfst6508.ts                 # Parser spécialisé CFST 6508
│   ├── parse-opa.ts                      # Parser spécialisé OPA
│   ├── parse-olt1-4.ts                   # Parser spécialisé OLT1-4
│   ├── parse-generic.ts                  # Parser générique (lois, ordonnances, directives)
│   ├── parse-pdf.ts                      # Utilitaire extraction PDF (unpdf)
│   ├── chunk.ts                          # Découpage sémantique par article (max 512 tokens)
│   ├── embed.ts                          # Vectorisation OpenAI
│   ├── upload.ts                         # Upload Supabase + SHA-256 hash
│   └── run-all.ts                        # Orchestrateur complet
│
├── 📁 scripts/validate/                  # Benchmark & tests de qualité
│   ├── run-benchmark.ts                  # Validation sur 50 questions référence
│   └── questions.json                    # Questions de test
│
├── 📁 data/                              # PDFs réglementaires suisses
│   ├── lois/                             # 6 lois (LAA, LChim, LRS, LEg, LSPS, LIE)
│   ├── ordonnances/                      # 11 ordonnances (OLT5, OChim, OPB, etc.)
│   ├── directives/                       # 14 directives CFST + ESTI 407
│   ├── codes/                            # 2 articles (CO 328, CP 229)
│   └── [37 PDFs total]
│
├── 📁 deploy/                            # Configuration VPS
│   ├── nginx.conf                        # Reverse proxy, SSL, HSTS, CSP
│   ├── docker-compose.yml                # Stack Docker (Nginx)
│   └── deploy.sh                         # Script déploiement VPS
│
├── 📁 tests/benchmark/                   # Données test
│   └── questions.json                    # 50 questions de référence
│
├── 📁 specs/                             # Documentation complète
│   ├── spec.md                           # Spécification fonctionnelle complète
│   ├── plan.md                           # Plan de développement
│   ├── research.md                       # Recherche + justifications design
│   ├── data-model.md                     # Schéma BD détaillé
│   ├── contracts.md                      # API contracts (Edge Functions)
│   └── tasks.md                          # Tâches détaillées (50 items)
│
├── 📄 CLAUDE.md                          # Ce fichier
├── 📄 README.md                          # Introduction projet (public)
├── 📄 package.json                       # Dépendances Node.js
├── 📄 tsconfig.json                      # Config TypeScript
└── 📄 .gitignore
```

---

## Commandes principales

### 🔧 Développement Frontend

```bash
# Installer les dépendances
cd frontend && npm install

# Serveur de développement (hot-reload)
cd frontend && npm run dev
# → http://localhost:5173

# Build production
cd frontend && npx vite build
# → dist/ prêt pour déploiement

# Linting & formatting (si configuré)
cd frontend && npm run lint
cd frontend && npm run format
```

### 📄 Ingestion de corpus

```bash
# Ingérer TOUS les PDFs (complet)
npx tsx scripts/ingest/run-all.ts

# Étapes individuelles (pour debug)
npx tsx scripts/ingest/download-all.ts      # Télécharger PDFs
npx tsx scripts/ingest/parse-generic.ts     # Parser
npx tsx scripts/ingest/chunk.ts             # Chunking
npx tsx scripts/ingest/embed.ts             # Embeddings
npx tsx scripts/ingest/upload.ts            # Upload Supabase
```

### ✅ Validation & Benchmark

```bash
# Lancer benchmark sur 50 questions
npx tsx scripts/validate/run-benchmark.ts

# Résultats : score global, temps réponse moyen, sources citées
```

### 🚀 Déploiement Edge Functions

```bash
# Déployer fonction RAG
supabase functions deploy quickref-query --no-verify-jwt

# Déployer fonction feedback
supabase functions deploy quickref-feedback --no-verify-jwt

# Voir logs en temps réel
supabase functions logs quickref-query
```

### 🐳 Déploiement VPS (depuis le serveur)

```bash
# SSH vers VPS
ssh root@<IP_VPS>

# Déployer frontend + restart Nginx
cd /tmp/sst-quickref/sst-quickref/frontend && \
  npm install && \
  npx vite build && \
  cp -r dist/* /app/quickref/ && \
  docker exec securionis-nginx-1 nginx -s reload

# Vérifier statut Nginx
docker ps
docker logs securionis-nginx-1

# Redémarrer stack Docker si nécessaire
docker-compose restart
```

---

## Production & Déploiement

### Environnement Production

| Élément | Détail |
|--------|--------|
| **URL publique** | https://quickref.securionis.com |
| **Hébergement** | VPS Hostinger (4 CPU, 8 GB RAM) |
| **Conteneurisation** | Docker + Docker Compose |
| **Web server** | Nginx 1.25 |
| **SSL** | Let's Encrypt (certificat auto-renouvelé) |
| **Backend** | Supabase (projet `wixcqdyoqxdgqeqqmfqu`) |
| **DNS** | Cloudflare (DNS records : A, CNAME pour www) |

### Processus de déploiement

1. **Push sur Git** (ou merge main)
2. **CI/CD** (si configuré) ou déploiement manuel
3. **Frontend** : Build local → SCP vers VPS → Nginx reload
4. **Edge Functions** : `supabase functions deploy ...` (Supabase CLI)
5. **Migrations DB** : `supabase db push` (si changements schéma)

### Monitoring

- **Logs Supabase** : Dashboard Supabase → Functions → Logs
- **Logs Nginx** : `docker logs securionis-nginx-1`
- **Statut SLA** : https://status.supabase.com

### Rollback en cas de problème

```bash
# Revert frontend à version précédente
git log --oneline frontend/
git revert <commit-hash>
git push

# Revert Edge Function
# (Supabase garde historique - restaurer via Dashboard si besoin)
```

---

## Sécurité

### Audit de sécurité (4 avril 2026)

**Status:** ✅ **22 vulnérabilités corrigées**

### Mesures implémentées

#### 1️⃣ CORS
- ✅ Restreint à `quickref.securionis.com` + `localhost:5173`
- ❌ Plus de wildcard (`*`)
- Fichier : `supabase/functions/quickref-query/index.ts`

#### 2️⃣ Validation input
- **Taille question** : max 500 caractères
- **Langue** : détection + blocage non-FR
- **Sanitization** : alphanumérique, suppression caractères spéciaux
- Fichier : `validate.ts`

#### 3️⃣ Rate limiting
- **Anonymes** : 10 req/jour par IP (in-memory)
- **Abonnés** : illimité (token JWT valide)
- **Admin** : bypass via header `x-admin-key`
- Fichier : `rate-limit.ts`

#### 4️⃣ Authentification admin
- **Comparaison constant-time** : protection timing attack
- **Stockage sécurisé** : Supabase Secrets (QUICKREF_ADMIN_KEY)
- Fichier : `index.ts` (fonction RAG)

#### 5️⃣ Anonymisation PII
- **Avant logging** : suppression emails, téléphones, noms, adresses, entreprises suisses
- Regex patterns : détection automatique
- Fichier : `anonymize.ts`

#### 6️⃣ Injection de prompt
- **Encadrage** : question dans balises `<user_question>...</user_question>`
- **System prompt** : instruction sécurité explicite
- Résistance aux jailbreaks testée

#### 7️⃣ Gestion clés API
- **Anon key** : lectures uniquement (respects RLS)
- **Service role** : INSERT logs uniquement (backend Supabase)
- ❌ Pas de clés en client (localStorage, sessionStorage, query params)

#### 8️⃣ Row Level Security (RLS)
- ✅ Activée sur toutes tables
- `documents_sst` : SELECT all (public)
- `quickref_queries` : INSERT service role
- `feedback` : INSERT auth users
- `subscriptions` : SELECT/UPDATE auth users

#### 9️⃣ Intégrité des données
- **SHA-256 hash** : chaque chunk (traçabilité légale)
- **Immuabilité** : documents_sst est read-only pour app

#### 🔟 Nginx (headers de sécurité)
- ✅ **HSTS** : `max-age=31536000` (1 an)
- ✅ **CSP** : `base-uri 'self'`, `form-action 'self'`
- ✅ **X-Content-Type-Options** : `nosniff`
- ✅ **X-Frame-Options** : `DENY`
- ✅ **Permissions-Policy** : restrictif (pas camera, mic, geolocation)

#### 1️⃣1️⃣ Frontend (build)
- ✅ Source maps : **désactivées en production**
- ✅ Minification : active (Vite)
- ✅ Tree-shaking : actif

#### 1️⃣2️⃣ Dépendances
- ✅ `@supabase/supabase-js@2.49.4` : pinnée (évite drift)
- Audit régulier : `npm audit`, `npm update`

### Checklist sécurité post-déploiement

- [ ] HTTPS working (`https://quickref.securionis.com`)
- [ ] CSP headers visible (`curl -I https://quickref.securionis.com`)
- [ ] Rate limit testée (`curl` × 11 requests)
- [ ] Admin key protected (non en logs)
- [ ] OpenAI/Anthropic keys en Supabase Secrets (non en `.env`)
- [ ] RLS vérifiée (requête anon ne retourne que documents_sst)
- [ ] Logs anonymisés (pas de PII en Supabase)

---

## Corpus réglementaire

### Vue d'ensemble

| Catégorie | Nombre | Exemples |
|-----------|--------|----------|
| **Lois** | 6 | LAA (Loi accidents travail), LChim (Loi chimie), LRS, LEg, LSPS, LIE |
| **Ordonnances** | 11 | OLT5, OChim, OPB, ORRChim, OICF, OIBT, OPair, OSPS, OMAle, OSEC, OPI |
| **Directives CFST** | 14 | Diverses (sauf 1907, 2135, 2314 — en attente) |
| **Autres directives** | 1 | ESTI 407 (Signalisation sécurité) |
| **Codes** | 2 | CO Art. 328 (Contrat travail), CP Art. 229 (Droit pénal) |
| **Total** | **39 sources** | **~4480 chunks** (max 512 tokens/chunk) |

### Sources manquantes (TODO)

⚠️ **3 directives CFST** en attente d'ingestion :
- Directive 1907 (????)
- Directive 2135 (????)
- Directive 2314 (????)

📋 **Action requise** : Localiser PDFs, ajouter à `documents-registry.ts`, relancer ingestion

### Processus d'ingestion

1. **Registre** (`documents-registry.ts`) : liste sources, URLs fedlex, metadata
2. **Téléchargement** (`download-all.ts`) : requête SPARQL fedlex API
3. **Parsing** (`parse-*.ts`) : extraction texte/articles
4. **Chunking** (`chunk.ts`) : découpage sémantique (max 512 tokens)
5. **Embedding** (`embed.ts`) : OpenAI API
6. **Upload** (`upload.ts`) : Supabase + SHA-256
7. **Validation** : Benchmark sur 50 questions

---

## Historique des changements

### 2026-04-28
- 🚀 **Déploiement VPS Hostinger** (IP : 31.97.36.92)
- ☁️ **Cloudflare** mode Flexible — HTTPS sans certificat sur VPS
- 🔧 `nginx.conf` mis à jour (HTTP only côté VPS, headers sécurité)
- 📜 `deploy.sh` revu : commandes `setup` et `update`
- 🔑 Clé SSH ED25519 générée et installée sur VPS
- ✅ Site live : **https://quickref.securionis.com** (HTTP/2 200)
- 📦 Mise à jour GitHub : `git push sst-quickref ... --force`

### 2026-04-06
- 🔄 **Restructuration documentation** (CLAUDE.md nettoyé)
- 📚 Expansion corpus RAG : **971 → ~4480 chunks**
- 🔄 Téléchargement auto SPARQL fedlex + parser générique
- 📋 Inventaire 39 sources (lois, ordonnances, directives, codes)

### 2026-04-05
- 💳 **Abonnement Stripe** : Plan Pro CHF 29/mois
- 🔗 Intégration checkout + webhook Stripe
- 🔐 **Authentification** : Magic link Supabase Auth
- 📱 **Session unique** : 1 seul appareil simultané par abonné
- ⚠️ Bannière révocation si session active ailleurs

### 2026-04-04
- 🔒 **Audit sécurité complet** : 22 vulnérabilités corrigées
- ✅ CORS, rate-limit, anonymization, prompt injection, timing attack
- ✅ HSTS, CSP, Permissions-Policy, source maps disabled
- ✅ RLS, SHA-256 hash, constant-time admin key

### 2026-04-03
- 🚀 **Déploiement production** : https://quickref.securionis.com
- 🐳 VPS Hostinger (Docker + Nginx + SSL Let's Encrypt)
- 🔑 Accès admin Pro (header `x-admin-key`, bypass rate-limit)
- 🔄 Ingestion vrais PDFs : **411 → 971 chunks** (OLT1-4)
- 🎨 Responsive mobile, fix CORS, suppression "[URL non fournie]"
- 📝 System prompt : langage naturel (questions informelles)
- 🎯 Layout responsive (disclaimer inline, input toujours visible)
- 🏷️ Branding : ©2026 Securionis, CTA Plan Pro masquée (temp)

### 2026-04-02
- ✨ **Création projet complet** : structure + 50 tâches
- 📁 60+ fichiers source (frontend, backend, scripts, specs)
- 📝 Spécifications détaillées (spec, plan, research, data-model, contracts, tasks)

---

## Roadmap & Tâches en attente

### 🔴 Priorité critique

#### Corpus manquant
- [ ] **Localiser 3 directives CFST** (1907, 2135, 2314)
- [ ] Ajouter à `documents-registry.ts`
- [ ] Relancer ingestion (`run-all.ts`)
- **Impact** : completeness corpus SST suisse

#### Tests de régression
- [ ] Exécuter benchmark post-déploiement (50 questions)
- [ ] Vérifier score global + citations
- [ ] Documenter résultats

### 🟠 Priorité haute

#### Monitoring & observabilité
- [ ] Dashboard Supabase functions (latence, erreurs)
- [ ] Alerting (Stripe webhook fail, rate-limit spike)
- [ ] Logs Nginx archivés (S3 ou Backblaze B2)

#### Performance
- [ ] Optimiser embeddings (batch processing OpenAI)
- [ ] Cache vectoriel (Redis pour top-5 fréquents)
- [ ] Compression frontend (brotli, module federation)

#### Amélioration RAG
- [ ] Fine-tuning corpus (ajuster seuil 0.55)
- [ ] Hybrid search (BM25 + vectoriel)
- [ ] Feedback loop : améliorer réponses basées sur pouce haut/bas

### 🟡 Priorité moyenne

#### UX/Design
- [ ] Dark mode toggle
- [ ] Historique chat sauvegardé (auth users)
- [ ] Export réponse (PDF, Markdown)
- [ ] Partage réponse (lien court)

#### Features
- [ ] Multi-language (FR/DE/IT)
- [ ] Intégration Slack/Teams (chatbot)
- [ ] API publique (SaaS client)
- [ ] Analytics avancés (heatmap, user journey)

#### Compliance
- [ ] GDPR audit (DPA, données eu-only)
- [ ] ACCESSIBILITY : WCAG 2.1 AA audit
- [ ] Termes légaux (ToS, Privacy policy)

### 🟢 Nice-to-have

- [ ] Machine learning : classification automatique requêtes
- [ ] Voice input (speech-to-text)
- [ ] PDF upload (analyse documents utilisateur)
- [ ] Intégration Notion / confluence (sync corpus interne)

---

## Notes supplémentaires

### Contacts & Ressources

- **Supabase Dashboard** : https://app.supabase.com/ (projet `wixcqdyoqxdgqeqqmfqu`)
- **VPS SSH** : `ssh -i ~/.ssh/id_ed25519 root@31.97.36.92`
- **Stripe Dashboard** : https://dashboard.stripe.com/
- **Fedlex API** : https://www.fedlex.admin.ch/api/ (SPARQL, téléchargement PDFs)

### Variables d'environnement à vérifier

```bash
# Checklist
echo "Frontend VITE keys OK?" && grep VITE frontend/.env.production
echo "Supabase secrets OK?" && supabase secrets list
echo "Rate-limit config?" && grep "10" supabase/functions/quickref-query/rate-limit.ts
echo "Admin key?" && supabase secrets get QUICKREF_ADMIN_KEY
```

### Recommandations de maintenance

- **Hebdomadaire** : Vérifier logs Supabase (erreurs Edge Functions)
- **Mensuel** : Audit npm (`npm audit`, update deps)
- **Trimestrie**l : Renew SSL, backup DB
- **Annuel** : Sécurité audit complet, penetration test

---

**Fin du document.**
Pour contribuer ou poser des questions → `ks.aigle@gmail.com`
