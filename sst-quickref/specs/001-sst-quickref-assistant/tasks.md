# Tasks: SST-QuickRef — Assistant IA Réglementaire

**Input**: Design documents from `/specs/001-sst-quickref-assistant/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-quickref-query.md

**Tests**: Non explicitement demandés dans la spec. Les tâches de benchmark (50 questions de référence) sont incluses car elles font partie intégrante de la validation POC (SC-004).

**Organization**: Tasks groupées par user story pour implémentation et test indépendants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialisation du projet, structure de dossiers, dépendances

- [x] T001 Create project root structure with directories: `frontend/`, `supabase/functions/`, `supabase/migrations/`, `scripts/ingest/`, `scripts/validate/`, `tests/`, `docs/`
- [x] T002 [P] Initialize Vue 3 + Vite + TypeScript project in `frontend/` with Tailwind CSS dependency
- [x] T003 [P] Initialize Supabase project config in `supabase/config.toml` with pgvector extension enabled
- [x] T004 [P] Create environment configuration template in `.env.example` with all required variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, QUICKREF_SIMILARITY_THRESHOLD, QUICKREF_TOP_K)
- [x] T005 [P] Create legal disclaimer text in `docs/disclaimer.md` per FR-003 and contract response format

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schéma de base de données, infrastructure Edge Functions, pipeline d'ingestion — BLOQUE toutes les user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create migration `supabase/migrations/001_documents_sst.sql`: enable pgvector extension, create table documents_sst with vector(1536) column, HNSW index on embedding (cosine), unique constraint on (sha256_hash, source, article, version_date), enable RLS with policies (SELECT for all, INSERT/UPDATE/DELETE for admin only)
- [x] T007 [P] Create migration `supabase/migrations/002_quickref_queries.sql`: create table quickref_queries with all fields per data-model.md (including query_id returned in API responses), enable RLS with policies (INSERT via service role, SELECT for admin only)
- [x] T008 [P] Create migration `supabase/migrations/003_quickref_feedback.sql`: create table quickref_feedback with FK to quickref_queries, UNIQUE on query_id, enable RLS with policies (INSERT for authenticated, SELECT for admin only)
- [x] T009 Create chunking utility in `scripts/ingest/chunk.ts`: split text by article/alinéa/bloc thématique, max 512 tokens per chunk, preserve metadata (source, article, version_date)
- [x] T010 [P] Create embedding utility in `scripts/ingest/embed.ts`: call OpenAI text-embedding-3-small API, return vector(1536), handle rate limiting and retries
- [x] T011 [P] Create upload utility in `scripts/ingest/upload.ts`: insert chunks with embeddings into documents_sst via Supabase client, compute SHA-256 hash per chunk, skip duplicates
- [x] T012 Create shared types in `frontend/src/types/index.ts`: QuickRefQuery, QuickRefResponse (with query_id field), QuickRefSource, QuickRefFeedback types matching API contract

**Checkpoint**: Database schema deployed, ingestion utilities ready, types defined — user story implementation can begin

---

## Phase 3: User Story 1 — Poser une question réglementaire SST (Priority: P1) 🎯 MVP

**Goal**: Un utilisateur pose une question SST en français et reçoit une réponse sourcée avec citations vérifiables en < 3 secondes

**Independent Test**: Poser 10 questions de référence couvrant les 39 sources (OTConst, CFST 6508, OPA, OLT1-4, lois, ordonnances, directives CFST), vérifier que chaque réponse cite correctement l'article, la version et l'URL source

### Implementation for User Story 1

- [x] T013 [P] [US1] Create OTConst parser in `scripts/ingest/parse-otconst.ts`: extract articles from OTConst PDF/HTML source, preserve article numbers, version date, source URL
- [x] T014 [P] [US1] Create CFST 6508 parser in `scripts/ingest/parse-cfst6508.ts`: extract chapters and sections from CFST 6508, preserve metadata
- [x] T015 [P] [US1] Create OPA parser in `scripts/ingest/parse-opa.ts`: extract Art. 62 and related provisions from OPA, preserve metadata
- [x] T015b [P] [US1] Create OLT1-4 parser in `scripts/ingest/parse-olt1-4.ts`: extract articles from OLT1, OLT2, OLT3, OLT4
- [x] T015c [P] [US1] Create generic parser in `scripts/ingest/parse-generic.ts`: parser générique pour les 32 nouvelles sources (lois, ordonnances, directives CFST, ESTI, articles de code)
- [x] T015d [P] [US1] Create documents registry in `scripts/ingest/documents-registry.ts`: registre centralisé des 39 sources avec métadonnées (nom, URL fedlex, type, statut)
- [x] T015e [P] [US1] Create download script in `scripts/ingest/download-all.ts`: téléchargement automatique des PDFs via SPARQL fedlex API
- [x] T016 [US1] Create ingestion orchestrator in `scripts/ingest/run-all.ts`: execute all parsers (specific + generic) → chunk.ts → embed.ts → upload.ts, log progress, verify ~4480 chunks inserted in documents_sst, report summary (count per source, total tokens, errors). 3 directives CFST manquantes : 1907, 2135, 2314
- [x] T017 [US1] Create Edge Function `supabase/functions/quickref-query/index.ts`: implement full RAG pipeline — receive question, compute embedding via text-embedding-3-small, search pgvector (top-5, cosine similarity), check similarity threshold (0.75, refuse if all below), construct Claude Sonnet prompt with system prompt SST + context chunks, generate response with mandatory source citations, return query_id + formatted response per API contract (success or no-match)
- [x] T018 [US1] Create system prompt for Claude in `supabase/functions/quickref-query/system-prompt.ts`: instruct Claude to cite [Source] Art. XX — Version JJ.MM.AAAA — [URL], refuse to answer without sources, respond in French, include disclaimer
- [x] T019 [US1] Create benchmark questions file in `tests/benchmark/questions.json`: 50 reference questions covering OTConst (~25), CFST 6508 (~15), OPA (~10) with expected source/article for each
- [x] T020 [US1] Create benchmark runner in `scripts/validate/run-benchmark.ts`: execute all 50 questions against quickref-query Edge Function, measure response time, verify source citations match expected, compute accuracy rate and average latency, output results summary

**Checkpoint**: POC RAG fonctionnel — un utilisateur peut poser une question et recevoir une réponse sourcée. Validé sur 50 questions de référence (SC-002 > 95%, SC-001 < 3s, SC-004 > 80%)

---

## Phase 4: User Story 2 — Intégration Securionis Inspect (Priority: P2)

**Goal**: Un inspecteur clique sur "Texte applicable" depuis un point de contrôle dans Securionis Inspect et obtient les textes réglementaires pertinents sans formuler de question

**Independent Test**: Appeler l'API avec un contexte thème/catégorie et vérifier que la réponse est pertinente au point de contrôle

### Implementation for User Story 2

- [x] T021 [US2] Extend Edge Function `supabase/functions/quickref-query/index.ts`: add context-based query support — when context.theme and context.category are provided, construct a targeted search query filtering chunks by source/article matching category, instead of relying solely on user question
- [x] T022 [US2] Implement fallback URL logic in `supabase/functions/quickref-query/index.ts`: on error responses, include `fallback_url` field pointing to the official PDF source URL for the requested theme/category, per FR-019
- [x] T023 [US2] Create JWT validation middleware in `supabase/functions/quickref-query/auth.ts`: verify Supabase JWT token, extract user_type (inspector/admin), pass to query handler for logging and rate limit bypass
- [x] T024 [US2] Add integration documentation in `docs/securionis-integration.md`: document how Securionis Inspect frontend should call POST /api/quickref/query with context object, handle fallback_url, display results

**Checkpoint**: L'API supporte les requêtes contextuelles depuis Securionis Inspect avec authentification JWT et fallback PDF

---

## Phase 5: User Story 3 — Landing page publique + freemium (Priority: P3)

**Goal**: Un visiteur non authentifié découvre SST-QuickRef via la landing page, teste le service avec 10 requêtes gratuites/jour, et peut s'inscrire au plan Pro

**Independent Test**: Accéder à la landing page, poser une question de démo, vérifier réponse sourcée sans authentification, atteindre la limite de 10 requêtes et vérifier le message d'upgrade

### Implementation for User Story 3

- [x] T025 [P] [US3] Create ChatWindow component in `frontend/src/components/ChatWindow.vue`: message list, input field, send button, auto-scroll, loading spinner during API call
- [x] T026 [P] [US3] Create MessageBubble component in `frontend/src/components/MessageBubble.vue`: user question bubble (right), assistant response bubble (left) with markdown rendering
- [x] T027 [P] [US3] Create SourceCard component in `frontend/src/components/SourceCard.vue`: display source name, article, version date, clickable URL, excerpt toggle per FR-014 citation format
- [x] T028 [P] [US3] Create DisclaimerBanner component in `frontend/src/components/DisclaimerBanner.vue`: persistent disclaimer text per FR-003, styled as subtle footer banner
- [x] T029 [US3] Create QuickRef API service in `frontend/src/services/quickref-api.ts`: POST to /api/quickref/query, handle all response types (success with query_id, no-match, rate-limited, error, unsupported-language), parse and return typed response
- [x] T030 [US3] Create chat composable in `frontend/src/composables/useChat.ts`: manage conversation state (messages array with query_id per response), send question, receive response, handle loading/error states, integrate with quickref-api service
- [x] T031 [US3] Implement rate limiting in Edge Function `supabase/functions/quickref-query/rate-limit.ts`: track anonymous requests by IP (in-memory map with TTL), enforce 10 req/day limit, return 429 response per contract format with X-RateLimit-Remaining and X-RateLimit-Reset headers
- [x] T032 [US3] Create rate limit composable in `frontend/src/composables/useRateLimit.ts`: parse X-RateLimit-Remaining header, display remaining requests count, show upgrade CTA when limit reached (CHF 29/mois)
- [x] T033 [US3] Create LandingPage in `frontend/src/pages/LandingPage.vue`: hero section explaining SST-QuickRef value proposition, embedded ChatWindow component for demo, CTA to subscribe/waitlist, Securionis branding
- [x] T034 [US3] Create ChatPage in `frontend/src/pages/ChatPage.vue`: full-screen chat interface with ChatWindow, SourceCard sidebar, DisclaimerBanner footer, responsive layout for tablet (min 44x44px touch targets)
- [x] T035 [US3] Configure Vue Router in `frontend/src/router/index.ts`: routes for / (LandingPage) and /chat (ChatPage)
- [x] T036 [US3] Configure Vite build and deployment in `frontend/vite.config.ts`: base URL, Supabase proxy in dev, production build output

**Checkpoint**: Landing page fonctionnelle avec chat, sources cliquables, rate limiting freemium, responsive tablette

---

## Phase 6: User Story 4 — Historique et mode hors-ligne partiel (Priority: P4)

**Goal**: Les 50 dernières réponses sont disponibles en cache local, consultables même hors connexion

**Independent Test**: Poser des questions, couper le réseau, vérifier que les réponses précédentes sont consultables

### Implementation for User Story 4

- [x] T037 [US4] Create offline cache composable in `frontend/src/composables/useOfflineCache.ts`: store last 50 Q&A pairs in IndexedDB (idb-keyval or raw API), FIFO eviction, load on app start, persist after each response
- [x] T038 [US4] Create online status composable in `frontend/src/composables/useOnlineStatus.ts`: detect navigator.onLine changes, emit events, show offline banner in UI
- [x] T039 [US4] Integrate offline cache into ChatPage in `frontend/src/pages/ChatPage.vue`: load cached conversations on mount, display cached responses when offline, show "hors-ligne" indicator, disable input when offline

**Checkpoint**: Cache local fonctionnel avec IndexedDB, historique consultable hors-ligne, transition online/offline transparente

---

## Phase 7: User Story 5 — Signaler une réponse incorrecte (Priority: P5)

**Goal**: L'utilisateur peut donner un feedback pouce haut/bas sur chaque réponse, enregistré pour amélioration continue

**Independent Test**: Afficher une réponse, cliquer pouce bas, vérifier l'enregistrement dans quickref_feedback

### Implementation for User Story 5

- [x] T040 [P] [US5] Create Edge Function `supabase/functions/quickref-feedback/index.ts`: receive query_id + rating (up/down), insert into quickref_feedback, validate query_id exists in quickref_queries, enforce UNIQUE constraint, return success/error
- [x] T041 [P] [US5] Create FeedbackButton component in `frontend/src/components/FeedbackButton.vue`: thumbs up/down icons, toggle state, call feedback Edge Function with query_id, disable after submission, show confirmation
- [x] T042 [US5] Integrate FeedbackButton into MessageBubble in `frontend/src/components/MessageBubble.vue`: display FeedbackButton below each assistant response, pass query_id from chat composable state

**Checkpoint**: Feedback fonctionnel, chaque réponse a un bouton pouce haut/bas, enregistré en base via query_id

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Anonymisation, intégrité, observabilité, sécurité — améliorations transversales

- [x] T043 [P] Implement query anonymization in `supabase/functions/quickref-query/anonymize.ts`: regex-based removal of Swiss proper nouns (company names, addresses, personal names) before logging to quickref_queries, per FR-015
- [x] T044 [P] Implement document freshness badge logic in `frontend/src/components/SourceCard.vue`: display "Texte à jour au [version_date]" badge per FR-016, warn if version_date > 6 months old
- [x] T045 [P] Implement document versioning support in `supabase/functions/quickref-query/index.ts`: add optional `include_superseded` query parameter, when true return historical versions alongside current, per FR-018
- [x] T046 [P] Add observability metrics collection in `supabase/functions/quickref-query/metrics.ts`: log response_ms, similarity_score, was_refused, user_type to quickref_queries on every request, per SC-008 monitoring
- [x] T047 Implement unsupported language detection in `supabase/functions/quickref-query/index.ts`: detect non-French input (basic heuristic on language field), return 400 unsupported_language response per contract
- [x] T048 Implement input validation in `supabase/functions/quickref-query/validate.ts`: question length max 500 chars, sanitize context.theme and context.category fields against injection, validate JWT signature in auth.ts, configure CORS for frontend domain only
- [x] T049 Create 90-day log retention cleanup in `supabase/migrations/005_log_retention.sql`: pg_cron job or SQL function to delete quickref_queries older than 90 days, per assumption
- [x] T050 Run quickstart.md end-to-end validation: follow all 8 steps in `specs/001-sst-quickref-assistant/quickstart.md`, verify each step succeeds, document any fixes needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — MVP core, must complete first
- **US2 (Phase 4)**: Depends on Foundational + US1 (reuses quickref-query Edge Function)
- **US3 (Phase 5)**: Depends on Foundational + US1 (needs working API to build frontend)
- **US4 (Phase 6)**: Depends on US3 (needs ChatPage to add offline cache)
- **US5 (Phase 7)**: Depends on Foundational + US3 (needs MessageBubble to add feedback button)
- **Polish (Phase 8)**: Can start partially after US1, fully after all stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **US2 (P2)**: Depends on US1 (extends quickref-query Edge Function) — Independently testable via API
- **US3 (P3)**: Depends on US1 (needs working API) — Can start frontend scaffolding in parallel with US1
- **US4 (P4)**: Depends on US3 (needs ChatPage UI) — Independently testable once ChatPage exists
- **US5 (P5)**: Depends on US3 (needs MessageBubble UI) — Edge Function can be built in parallel

### Within Each User Story

- Models/migrations before services
- Edge Functions before frontend integration
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004, T005 can all run in parallel (Phase 1)
- T007, T008 can run in parallel with T006 (Phase 2)
- T009, T010, T011 can partially parallel (T010, T011 independent; T009 prerequisite for T016)
- T013, T014, T015 can all run in parallel (US1 parsers)
- T025, T026, T027, T028 can all run in parallel (US3 components)
- T040, T041 can run in parallel (US5 backend + frontend)
- T043, T044, T045, T046 can all run in parallel (Phase 8 polish)

---

## Parallel Example: User Story 1

```bash
# Launch all parsers in parallel:
Task: "T013 [P] [US1] Create OTConst parser in scripts/ingest/parse-otconst.ts"
Task: "T014 [P] [US1] Create CFST 6508 parser in scripts/ingest/parse-cfst6508.ts"
Task: "T015 [P] [US1] Create OPA parser in scripts/ingest/parse-opa.ts"

# Then sequentially:
Task: "T016 [US1] Create ingestion orchestrator in scripts/ingest/run-all.ts"
Task: "T017 [US1] Create Edge Function quickref-query"
```

## Parallel Example: User Story 3

```bash
# Launch all Vue components in parallel:
Task: "T025 [P] [US3] Create ChatWindow component"
Task: "T026 [P] [US3] Create MessageBubble component"
Task: "T027 [P] [US3] Create SourceCard component"
Task: "T028 [P] [US3] Create DisclaimerBanner component"

# Then sequentially:
Task: "T029 [US3] Create QuickRef API service"
Task: "T030 [US3] Create chat composable"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T012) — CRITICAL
3. Complete Phase 3: User Story 1 (T013-T020)
4. **STOP and VALIDATE**: Run benchmark (T020) — verify SC-001 (<3s), SC-002 (>95%), SC-004 (>80%)
5. POC validé — prêt pour démonstration aux inspecteurs terrain

### Incremental Delivery

1. Setup + Foundational → Infrastructure prête
2. US1 → POC RAG validé sur 50 questions → **Démo inspecteurs** (Phase 0 du rapport)
3. US3 → Landing page avec chat → **MVP public** (Phase 1 du rapport)
4. US2 → API contextuelle + intégration Inspect → **Intégration Securionis** (Phase 2 du rapport)
5. US4 + US5 → Cache offline + feedback → **Expérience complète**
6. Polish → Anonymisation, sécurité, observabilité → **Production-ready**

### Parallel Team Strategy

Avec 2 développeurs :

1. Tous : Setup + Foundational ensemble
2. Une fois Foundational terminé :
   - Dev A : US1 (parsers + Edge Function RAG) puis US2 (API contextuelle)
   - Dev B : US3 frontend scaffolding (composants Vue) en parallèle, attendre US1 pour intégration API
3. Séquentiellement : US4 → US5 → Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Le benchmark (T020) est le gate de qualité principal — ne pas passer à US2/US3 si SC-002 < 95%
