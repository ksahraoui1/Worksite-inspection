# Tasks: Controle Chantier — Inspection Securite OTConst/SUVA

**Input**: Design documents from `specs/001-controle-chantier/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api-routes.md, research.md, quickstart.md

**Tests**: Tests inclus pour la state machine ecart (critique metier) et le flux d'inspection (integration). Les tests unitaires supplementaires sont optionnels.

**Organization**: Tasks groupees par user story pour implementation et test independants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelisable (fichiers differents, pas de dependances)
- **[Story]**: User story associee (US1, US2, US3, US4, US5, US6)
- Chemins exacts dans les descriptions

## Path Conventions

- **App Router**: `src/app/`
- **Components**: `src/components/`
- **Library**: `src/lib/`
- **Types**: `src/types/`
- **Hooks**: `src/hooks/`
- **Migrations**: `supabase/migrations/`
- **Tests**: `tests/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialisation du projet Next.js, configuration Supabase, Tailwind, PWA

- [x] T001 Initialiser le projet Next.js 14+ App Router avec TypeScript strict dans `woksite-inspection/` via `npx create-next-app@latest . --typescript --tailwind --app --src-dir`
- [x] T002 Installer les dependances : `@supabase/supabase-js @supabase/ssr dexie dexie-react-hooks @react-pdf/renderer serwist @serwist/next resend`
- [x] T003 [P] Creer `.env.example` et `.env.local` avec les variables Supabase et Resend dans `woksite-inspection/.env.example`
- [x] T004 [P] Configurer Serwist dans `next.config.ts` (swSrc, swDest, disable en dev, navigationPreload, skipWaiting, clientsClaim)
- [x] T005 [P] Creer le Service Worker `src/app/sw.ts` avec defaultCache et fallbacks offline
- [x] T006 [P] Creer `public/manifest.json` pour le PWA (nom, icones, theme_color, display: standalone)
- [x] T007 [P] Configurer `src/app/globals.css` avec Tailwind base/components/utilities et styles mobile-first (min-touch 44px)

**Checkpoint**: Projet Next.js demarre, Tailwind fonctionne, PWA manifest present.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema BDD, migrations, seed, clients Supabase, types, composants UI de base

**CRITICAL**: Aucune user story ne peut commencer avant completion de cette phase.

- [x] T008 Initialiser Supabase localement via `npx supabase init` et configurer `supabase/config.toml`
- [x] T009 Creer la migration `supabase/migrations/001_create_phases.sql` — table `phase` avec colonnes id, numero, nom, description, created_at
- [x] T010 Creer la migration `supabase/migrations/002_create_checklist_items.sql` — table `checklist_item` avec FK phase_id, colonnes corps_metier, question, reference_legale NOT NULL, ordre
- [x] T011 [P] Creer la migration `supabase/migrations/003_create_chantiers.sql` — table `chantier` avec soft-delete, colonnes nom, adresse, dates, responsable_securite, responsable_email, statut CHECK
- [x] T012 [P] Creer la migration `supabase/migrations/004_create_entreprises.sql` — tables `entreprise` (soft-delete) et `chantier_entreprise` (jointure M:N, UNIQUE constraint)
- [x] T013 Creer la migration `supabase/migrations/005_create_visites.sql` — table `visite` avec FK chantier_id + phase_id, soft-delete, colonnes inspecteur_nom, date_visite, statut CHECK
- [x] T014 Creer la migration `supabase/migrations/006_create_reponses_ecarts.sql` — tables `reponse_visite` (UNIQUE visite+item) et `ecart` (FK visite+item+entreprise, statut CHECK 3 etats, severite, soft-delete)
- [x] T015 Creer la migration `supabase/migrations/007_create_indexes.sql` — tous les index recommandes du data-model.md (idx_visite_chantier, idx_ecart_statut, idx_ecart_delai, etc.)
- [x] T016 Creer la migration `supabase/migrations/008_create_rls_policies.sql` — activer RLS sur toutes les tables, policies SELECT/INSERT/UPDATE avec filtre deleted_at IS NULL
- [x] T017 Creer `supabase/seed.sql` — insertion des 5 phases et des 12 checklist items OTConst/SUVA (Phase 1: 3 items, Phase 2: 2 items, Phase 3: 3 items, Phase 4: 2 items, Phase 5: 2 items) avec toutes les references legales
- [x] T018 [P] Creer `src/types/database.ts` — types TypeScript pour toutes les entites (Phase, ChecklistItem, Chantier, Entreprise, ChantierEntreprise, Visite, ReponseVisite, Ecart) avec enums pour statuts
- [x] T019 [P] Creer `src/lib/supabase/client.ts` — client Supabase browser avec createBrowserClient
- [x] T020 [P] Creer `src/lib/supabase/server.ts` — client Supabase server-side avec createServerClient + cookies
- [x] T021 [P] Creer `src/lib/supabase/middleware.ts` — middleware auth Supabase pour Next.js, integrer dans `src/middleware.ts`
- [x] T022 [P] Creer `src/lib/utils/ecart-state.ts` — state machine ecart avec fonction `isValidTransition(current, target): boolean` et `getAvailableTransitions(current): string[]`
- [x] T023 [P] Creer `src/lib/dexie/db.ts` — schema Dexie.js v1 avec tables offlineVisites, offlineReponses, offlineEcarts, offlinePhotos et index syncStatus
- [x] T024 [P] Creer `src/hooks/use-online-status.ts` — hook React detectant online/offline via navigator.onLine + event listeners
- [x] T025 [P] Creer les composants UI de base dans `src/components/ui/` : button.tsx (variantes primary/danger/ghost, min 44px touch), card.tsx, badge.tsx (variantes statut/alerte), modal.tsx, spinner.tsx
- [x] T026 Creer `src/app/layout.tsx` — layout global avec Tailwind, meta viewport mobile, chargement polices, structure responsive (header + main + nav mobile bottom)

**Checkpoint**: BDD prete, seed charge, clients Supabase fonctionnels, types generes, composants UI de base disponibles.

---

## Phase 3: User Story 1 — Dashboard chantiers et alertes (Priority: P1)

**Goal**: Afficher la liste des chantiers actifs avec alertes ecarts en retard + detail chantier avec timeline visites.

**Independent Test**: Creer 2-3 chantiers avec des ecarts en retard, verifier que le dashboard les affiche avec badges rouges. Cliquer sur un chantier pour voir la timeline des visites.

### Implementation for User Story 1

- [x] T027 [US1] Creer `src/components/dashboard/chantier-card.tsx` — card affichant nom, adresse, responsable, statut + badge rouge avec nombre d'ecarts en retard
- [x] T028 [US1] Creer `src/components/dashboard/alertes-banner.tsx` — banniere globale affichant le total des ecarts en retard tous chantiers confondus
- [x] T029 [US1] Creer `src/app/page.tsx` — page dashboard listant tous les chantiers actifs (query Supabase avec jointure ecarts en retard), composants chantier-card, banniere alertes
- [x] T030 [US1] Creer `src/components/chantier/timeline-visites.tsx` — composant timeline affichant les visites ordonnees desc par date, avec phase, inspecteur, statut et nombre d'ecarts
- [x] T031 [US1] Creer `src/app/chantiers/[id]/page.tsx` — page detail chantier avec en-tete (nom, adresse, dates, responsable), timeline visites, resume ecarts actifs

**Checkpoint**: Dashboard fonctionnel, navigation vers detail chantier avec timeline. Badges alertes visibles.

---

## Phase 4: User Story 2 — Realisation d'une visite d'inspection (Priority: P1)

**Goal**: Creer une visite, repondre aux points de controle, documenter les ecarts avec photo et note.

**Independent Test**: Depuis le detail d'un chantier, creer une visite Phase 1, repondre aux 3 points de controle, marquer un comme Non Conforme, creer un ecart avec photo, terminer la visite, verifier dans la timeline.

### Implementation for User Story 2

- [x] T032 [P] [US2] Creer `src/components/inspection/phase-selector.tsx` — selecteur des 5 phases de construction avec description, icone et nombre de points de controle
- [x] T033 [P] [US2] Creer `src/lib/utils/photo-compress.ts` — compression photo mobile (max 1920px, <2MB, qualite 0.85→0.5) avec fallback OffscreenCanvas/HTMLCanvasElement
- [x] T034 [US2] Creer `src/components/inspection/checklist-item.tsx` — composant individuel point de controle avec boutons Conforme/Non Conforme/Non Applicable, reference legale visible, style mobile tactile 44px
- [x] T035 [US2] Creer `src/components/ecart/photo-capture.tsx` — composant capture photo via camera mobile (input type file accept image/*) avec preview, compression via photo-compress.ts, upload Supabase Storage
- [x] T036 [US2] Creer `src/components/ecart/ecart-form.tsx` — formulaire creation ecart : constat (textarea), photo (photo-capture), selection entreprise (dropdown depuis chantier_entreprise), delai resolution (date picker), severite (a_corriger/stop_danger)
- [x] T037 [US2] Creer `src/components/inspection/checklist-form.tsx` — formulaire complet de checklist : liste des checklist-items pour la phase, gestion des reponses, ouverture ecart-form sur Non Conforme, bouton terminer visite
- [x] T038 [US2] Creer `src/app/chantiers/[id]/visites/nouvelle/page.tsx` — page creation visite avec phase-selector, puis redirection vers le formulaire d'inspection
- [x] T039 [US2] Creer `src/app/chantiers/[id]/visites/[visiteId]/page.tsx` — page formulaire inspection integrant checklist-form, sauvegarde reponses via upsert Supabase, creation ecarts, finalisation visite (statut terminee)

**Checkpoint**: Visite complete de bout en bout. Points de controle OTConst/SUVA avec references legales. Ecarts avec photo. Visite visible dans timeline.

---

## Phase 5: User Story 3 — Bouton STOP EN CAS DE DANGER (Priority: P1)

**Goal**: Bouton rouge persistant sur tous les ecrans, declenchement immediat STOP Danger avec notification email.

**Independent Test**: Naviguer sur 3 ecrans differents, verifier que le bouton rouge est toujours visible. Appuyer dessus, remplir le formulaire rapide, verifier qu'un ecart STOP Danger est cree et que l'email est envoye.

### Implementation for User Story 3

- [x] T040 [P] [US3] Creer `src/lib/notifications/email.ts` — integration Resend : fonction sendStopDangerEmail(responsableEmail, chantierNom, constat) avec template HTML
- [x] T041 [P] [US3] Creer `src/app/api/ecarts/stop-danger/route.ts` — API POST : valider chantier_id, creer ecart statut stop_danger, envoyer notification email, retourner ecart + notification_sent
- [x] T042 [US3] Creer `src/components/stop-danger/stop-modal.tsx` — modal formulaire rapide : selection chantier (dropdown), description danger (textarea), bouton valider rouge, appel API stop-danger
- [x] T043 [US3] Creer `src/components/stop-danger/stop-button.tsx` — bouton rouge fixe (position fixed bottom-right, z-index eleve, min 56px, ombre portee) qui ouvre stop-modal au tap
- [x] T044 [US3] Integrer stop-button.tsx dans `src/app/layout.tsx` — ajouter le composant StopButton dans le layout global pour qu'il soit visible sur tous les ecrans

**Checkpoint**: Bouton STOP rouge visible partout. Formulaire rapide. Ecart STOP Danger cree. Email envoye au responsable.

---

## Phase 6: User Story 4 — Gestion des ecarts et suivi de resolution (Priority: P2)

**Goal**: Liste filtrable des ecarts par chantier, transitions de statut, indicateurs de retard.

**Independent Test**: Depuis le detail d'un chantier, consulter les ecarts, filtrer par entreprise, marquer un ecart comme Resolu, verifier qu'il disparait des alertes du dashboard.

### Implementation for User Story 4

- [x] T045 [P] [US4] Creer `src/app/api/ecarts/[id]/transition/route.ts` — API PATCH : valider transition via ecart-state.ts, mettre a jour statut, set date_resolution si resolu, envoyer notification si escalade stop_danger
- [x] T046 [US4] Creer `src/components/ecart/ecart-list.tsx` — liste ecarts avec filtres (statut, entreprise), tri (date, delai), badge retard (jours depasses en rouge), vignette photo, boutons de transition de statut
- [x] T047 [US4] Ajouter un onglet/section ecarts dans `src/app/chantiers/[id]/page.tsx` — integrer ecart-list.tsx filtree par chantier, avec compteur par statut (a_corriger, stop_danger, resolu)

**Checkpoint**: Ecarts consultables, filtrables, transitions fonctionnelles. Indicateurs de retard visibles.

---

## Phase 7: User Story 5 — Generation de rapport PDF (Priority: P2)

**Goal**: Generer un PDF complet pour une visite terminee avec tous les constats, photos et references legales.

**Independent Test**: Terminer une visite avec 2 ecarts documentes (dont 1 avec photo), generer le PDF, verifier que toutes les informations sont presentes, telecharger le fichier.

### Implementation for User Story 5

- [x] T048 [P] [US5] Creer `src/components/pdf/rapport-visite.tsx` — template @react-pdf/renderer avec : en-tete chantier (nom, adresse, dates), info visite (date, inspecteur, phase), tableau points de controle (question, ref legale, resultat), section ecarts (constat, photo Image, entreprise, delai, severite), pied de page
- [x] T049 [US5] Creer `src/app/api/visites/[id]/pdf/route.ts` — API POST : charger visite + reponses + ecarts + photos signees, generer PDF via renderToBuffer, retourner application/pdf avec nom fichier [Date]-[Chantier]-Visite-[Phase].pdf
- [x] T050 [US5] Creer `src/app/chantiers/[id]/visites/[visiteId]/rapport/page.tsx` — page recap visite avec bouton "Generer rapport PDF", preview des constats, telechargement du PDF via l'API

**Checkpoint**: PDF genere avec 100% des informations. Telechargement fonctionnel. Nom de fichier correct.

---

## Phase 8: User Story 6 — Gestion des chantiers et entreprises (Priority: P3)

**Goal**: CRUD chantiers et entreprises, association M:N chantier-entreprise.

**Independent Test**: Creer un chantier, y associer 2 entreprises, verifier que les entreprises apparaissent dans le dropdown lors de la creation d'un ecart.

### Implementation for User Story 6

- [x] T051 [P] [US6] Creer `src/components/chantier/chantier-form.tsx` — formulaire CRUD chantier : nom, adresse, date debut, date fin prevue, responsable securite (nom + email), statut. Validation email obligatoire. Alerte si cloture avec ecarts non resolus (FR-014)
- [x] T052 [P] [US6] Creer `src/app/chantiers/page.tsx` — page liste chantiers avec bouton "Nouveau chantier", filtres actif/termine
- [x] T053 [US6] Creer `src/app/chantiers/nouveau/page.tsx` — page creation chantier integrant chantier-form.tsx, insertion Supabase, redirection vers detail apres creation
- [x] T054 [US6] Creer `src/app/chantiers/[id]/entreprises/page.tsx` — page gestion entreprises du chantier : liste entreprises associees, formulaire ajout (nom, corps metier, contact), bouton dissocier, insertion chantier_entreprise

**Checkpoint**: CRUD chantiers fonctionnel. Entreprises associees. Donnees disponibles dans le module d'inspection.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Mode hors-ligne, synchronisation, tests critiques, finitions UI

- [x] T055 [P] Creer `src/lib/sync/sync-manager.ts` — gestionnaire de sync : detection online, poll 30s, batch upload ecarts+photos pending, strategie last-write-wins, protection STOP Danger, gestion erreurs avec backoff
- [x] T056 [P] Creer `src/hooks/use-sync.ts` — hook React integrant sync-manager, indicateur de sync dans l'UI (dernier sync, pending count)
- [x] T057 [P] Creer `tests/unit/ecart-state.test.ts` — tests unitaires Vitest : toutes transitions valides, transitions invalides (resolu → X), getAvailableTransitions pour chaque etat
- [x] T058 [P] Creer `tests/integration/inspection-flow.test.ts` — test integration : creer visite, repondre checklist, creer ecart, terminer visite, verifier dans timeline
- [x] T059 [P] Creer `tests/integration/stop-danger.test.ts` — test integration : declencher STOP Danger, verifier ecart cree, verifier notification envoyee
- [x] T060 Ajouter indicateur de statut de connexion (online/offline) et sync dans `src/app/layout.tsx` via use-online-status et use-sync
- [x] T061 Valider la responsivite mobile sur tous les ecrans (360px, 768px, 1024px) — verifier boutons 44px, pas de scroll horizontal, bouton STOP toujours visible
- [x] T062 Executer `supabase db push && supabase db seed` et valider que les 5 phases et 12 checklist items sont correctement charges avec references legales
- [x] T063 Executer le quickstart.md complet : creation chantier → association entreprise → visite → inspection → ecart → rapport PDF → STOP Danger

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Aucune dependance — demarrer immediatement
- **Foundational (Phase 2)**: Depend de Phase 1 — **BLOQUE toutes les user stories**
- **US1 Dashboard (Phase 3)**: Depend de Phase 2
- **US2 Inspection (Phase 4)**: Depend de Phase 2
- **US3 STOP Danger (Phase 5)**: Depend de Phase 2
- **US4 Ecarts (Phase 6)**: Depend de US2 (ecarts crees pendant l'inspection)
- **US5 PDF (Phase 7)**: Depend de US2 (visites terminees necessaires)
- **US6 CRUD Chantiers (Phase 8)**: Depend de Phase 2 (peut etre parallelise avec US1)
- **Polish (Phase 9)**: Depend de toutes les user stories

### User Story Dependencies

- **US1 (P1)**: Phase 2 → independant
- **US2 (P1)**: Phase 2 → independant
- **US3 (P1)**: Phase 2 → independant
- **US4 (P2)**: Phase 2 + US2 (ecarts doivent exister)
- **US5 (P2)**: Phase 2 + US2 (visites doivent exister)
- **US6 (P3)**: Phase 2 → independant (mais plus utile apres US1)

### Within Each User Story

- Composants UI avant pages
- Lib/utils avant composants qui les utilisent
- API routes avant pages qui les appellent
- Taches [P] parallelisables entre elles

### Parallel Opportunities

- Phase 2: T011, T012 en parallele | T018-T025 tous en parallele
- Phase 3: T027, T028 en parallele → T029 → T030, T031
- Phase 4: T032, T033 en parallele → T034 → T035, T036 → T037 → T038, T039
- Phase 5: T040, T041 en parallele → T042 → T043, T044
- Phase 6: T045 → T046 → T047
- Phase 7: T048 → T049 → T050
- Phase 8: T051, T052 en parallele → T053, T054
- Phase 9: T055-T059 tous en parallele → T060-T063

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US1 — Dashboard
4. Complete Phase 4: US2 — Inspection
5. Complete Phase 5: US3 — STOP Danger
6. **STOP and VALIDATE**: Tester le parcours complet sur mobile
7. Deploy/demo si pret

### Incremental Delivery

1. Setup + Foundational → Base technique prete
2. US1 Dashboard → Visualisation chantiers (demo)
3. US2 Inspection → Coeur fonctionnel (demo MVP)
4. US3 STOP Danger → Securite SUVA (demo MVP complet)
5. US4 Gestion ecarts → Suivi conformite (demo)
6. US5 Rapports PDF → Documentation officielle (demo)
7. US6 CRUD Chantiers → Administration (demo)
8. Polish → Offline, tests, finitions → Production

---

## Notes

- [P] tasks = fichiers differents, pas de dependances
- [Story] label mappe chaque tache a sa user story
- Chaque user story est independamment completable et testable
- Commit apres chaque tache ou groupe logique
- S'arreter a chaque checkpoint pour valider la story independamment
- Eviter : taches vagues, conflits sur le meme fichier, dependances cross-story qui cassent l'independance
