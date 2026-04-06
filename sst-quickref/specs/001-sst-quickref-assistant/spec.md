# Feature Specification: SST-QuickRef — Assistant IA Réglementaire

**Feature Branch**: `001-sst-quickref-assistant`  
**Created**: 2026-04-02  
**Status**: Implemented — Production (https://quickref.securionis.com)  
**Input**: Rapport de développement SST-QuickRef (15 pages, Version 1.0)

## Clarifications

### Session 2026-04-02

- Q: Quel est le périmètre cible de cette feature ? → A: Phase 0 à Phase 2 complètes (POC RAG + landing page chat freemium + intégration Securionis Inspect via API REST)
- Q: Quel comportement quand la pertinence des sources est faible ? → A: Refuser de répondre sous un seuil de pertinence, afficher "Aucun texte trouvé" avec suggestion de reformuler la question
- Q: Que se passe-t-il avec les anciennes versions de textes réglementaires mis à jour ? → A: Versioning avec priorisation — la version courante est affichée par défaut, les versions antérieures restent consultables sur demande
- Q: Comportement de l'intégration Securionis Inspect quand QuickRef est indisponible ? → A: Le bouton "Texte applicable" reste visible, affiche un message "Service temporairement indisponible" avec lien direct vers le PDF source officiel en fallback
- Q: Quelle cible de disponibilité et quelles métriques d'observabilité ? → A: 99,5 % de disponibilité en heures ouvrées (lun-ven 7h-18h), maintenance autorisée hors plage. Métriques : temps de réponse, taux de citations correctes, volume requêtes par type utilisateur, taux d'erreurs

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Poser une question réglementaire SST (Priority: P1)

Un inspecteur de terrain ou un responsable SST sur un chantier suisse a besoin de vérifier rapidement une exigence réglementaire. Il ouvre l'interface SST-QuickRef, saisit sa question en français (par exemple "Quelle est la hauteur minimale d'un garde-corps selon l'OTConst ?"), et obtient une réponse sourcée en quelques secondes. La réponse cite l'article exact, la loi source, la date de version du texte, et affiche un lien vers le document officiel.

**Why this priority**: C'est le coeur de la proposition de valeur. Sans cette capacité fondamentale de question-réponse réglementaire avec citations vérifiables, le produit n'a aucune raison d'exister. Cela résout directement les 3 problèmes identifiés : dispersion des sources, mises à jour fréquentes, et traçabilité défaillante.

**Independent Test**: Peut être testé en posant 10 questions de référence couvrant OTConst, CFST 6508 et OPA Art. 62, et en vérifiant que chaque réponse cite correctement l'article, la version du texte et l'URL source.

**Acceptance Scenarios**:

1. **Given** un corpus réglementaire indexé (OTConst, CFST 6508, OPA Art. 62), **When** l'utilisateur pose une question en français sur un point réglementaire couvert, **Then** le système affiche une réponse en moins de 3 secondes avec citation de l'article, la source législative, la date de version et un lien cliquable vers le document officiel.
2. **Given** une question portant sur un sujet non couvert par le corpus indexé, **When** l'utilisateur soumet cette question, **Then** le système indique "Aucun texte réglementaire trouvé" et suggère de reformuler la question, plutôt que de fournir une réponse non sourcée.
3. **Given** une réponse affichée à l'utilisateur, **When** l'utilisateur consulte la réponse, **Then** un disclaimer légal est visible indiquant que SST-QuickRef est un outil d'aide et ne constitue pas un avis juridique.
4. **Given** une requête dont les chunks retournés ont un score de pertinence inférieur au seuil défini, **When** le système évalue la pertinence, **Then** il refuse de générer une réponse et affiche un message invitant l'utilisateur à reformuler ou préciser sa question.

---

### User Story 2 - Consulter la référence réglementaire depuis un point de contrôle (Priority: P2)

Un inspecteur utilisant Securionis Inspect effectue une visite de chantier. En examinant un point de contrôle spécifique (par exemple "Protection contre les chutes"), il clique sur un bouton "Texte applicable" directement depuis le checkpoint. SST-QuickRef s'ouvre pré-filtré sur le thème SST correspondant et affiche immédiatement les textes réglementaires pertinents sans que l'inspecteur ait à formuler une question.

**Why this priority**: L'intégration dans Securionis Inspect est le principal vecteur d'adoption. Les inspecteurs utilisent déjà Securionis quotidiennement ; leur offrir un accès contextuel à la réglementation pendant l'inspection maximise la valeur perçue et l'usage.

**Independent Test**: Peut être testé en simulant un appel à l'API SST-QuickRef avec un contexte de thème/catégorie, et en vérifiant que la réponse est pertinente au point de contrôle sans nécessiter de question manuelle.

**Acceptance Scenarios**:

1. **Given** un inspecteur consultant un point de contrôle dans Securionis Inspect, **When** il clique sur "Texte applicable", **Then** SST-QuickRef affiche les textes réglementaires pertinents au thème SST de ce point de contrôle, avec les citations formelles.
2. **Given** un contexte de thème transmis automatiquement (par exemple "Protections_chutes" + "Article_47_OTConst"), **When** le système traite cette requête contextuelle, **Then** la réponse est centrée sur les articles spécifiquement applicables à ce thème, triés par pertinence.
3. **Given** le service SST-QuickRef temporairement indisponible, **When** l'inspecteur clique sur "Texte applicable", **Then** le bouton affiche "Service temporairement indisponible" et propose un lien direct vers le PDF source officiel du texte réglementaire en fallback.

---

### User Story 3 - Landing page publique et découverte du produit (Priority: P3)

Un professionnel SST (inspecteur indépendant, coordinateur sécurité) découvre SST-QuickRef via la landing page publique. Il peut tester le service avec un nombre limité de requêtes gratuites pour évaluer la pertinence et la qualité des réponses. S'il est convaincu, il s'inscrit sur la waitlist ou souscrit au plan Pro.

**Why this priority**: La landing page avec démo est essentielle pour l'acquisition utilisateur et la validation marché, mais elle intervient après les fonctionnalités core (Q&A et intégration Inspect).

**Independent Test**: Peut être testé en accédant à la landing page, en posant une question de démonstration, et en vérifiant que la réponse est affichée avec les sources, le tout sans authentification préalable.

**Acceptance Scenarios**:

1. **Given** un visiteur non authentifié sur la landing page SST-QuickRef, **When** il pose une question dans l'interface de démonstration, **Then** il reçoit une réponse sourcée identique en qualité à celle des utilisateurs authentifiés.
2. **Given** un visiteur ayant atteint la limite de requêtes gratuites (10/jour), **When** il tente une nouvelle requête, **Then** le système l'invite à créer un compte ou souscrire au plan Pro (CHF 29/mois).

---

### User Story 4 - Historique de conversation et mode hors-ligne partiel (Priority: P4)

Un inspecteur en visite de chantier avec une connexion réseau intermittente peut consulter les 50 dernières réponses SST-QuickRef en cache local. L'historique est maintenu par session d'inspection et permet de retrouver rapidement une référence déjà consultée.

**Why this priority**: Le mode hors-ligne partiel est une fonctionnalité de confort qui améliore l'expérience terrain sans être bloquante pour le lancement.

**Independent Test**: Peut être testé en posant des questions, puis en coupant la connexion réseau et en vérifiant que les réponses précédentes sont toujours consultables.

**Acceptance Scenarios**:

1. **Given** un utilisateur ayant posé plusieurs questions avec une connexion active, **When** la connexion réseau est perdue, **Then** les 50 dernières réponses restent consultables depuis le cache local.
2. **Given** un utilisateur revenant en ligne après une déconnexion, **When** il pose une nouvelle question, **Then** le système fonctionne normalement et l'historique en cache est préservé.

---

### User Story 5 - Signaler une réponse incorrecte (Priority: P5)

Un inspecteur expérimenté détecte qu'une réponse SST-QuickRef cite un article obsolète ou fournit une interprétation erronée. Il utilise le bouton "pouce bas" pour signaler le problème. Ce feedback est enregistré pour améliorer la qualité du système.

**Why this priority**: Le feedback utilisateur est crucial pour l'amélioration continue et la confiance, mais c'est une fonctionnalité secondaire par rapport au Q&A lui-même.

**Independent Test**: Peut être testé en affichant une réponse, cliquant sur le bouton de feedback négatif, et vérifiant que le signalement est enregistré.

**Acceptance Scenarios**:

1. **Given** une réponse affichée à l'utilisateur, **When** l'utilisateur clique sur le bouton "pouce bas", **Then** le signalement est enregistré avec la question, la réponse et les sources citées.

---

### Edge Cases

- Que se passe-t-il lorsque l'utilisateur pose une question dans une langue non supportée (anglais, italien) ? Le système doit répondre en indiquant que seul le français est supporté en Phase 1.
- Comment le système gère-t-il une question ambiguë qui correspond à plusieurs articles de lois différentes ? Il doit présenter les articles les plus pertinents avec une explication du périmètre de chacun.
- Que se passe-t-il si un texte réglementaire a été mis à jour mais pas encore ré-indexé ? Le badge de fraîcheur indique la date de dernière indexation ; l'ancienne version reste consultable avec mention "version antérieure".
- Comment le système réagit-il en cas d'indisponibilité du service de génération de réponses ? Un message d'erreur clair doit être affiché avec suggestion de réessayer plus tard. Dans Securionis Inspect, un lien direct vers le PDF source officiel est proposé en fallback.
- Que se passe-t-il si la question contient des informations personnelles (nom de chantier, entreprise) ? Les logs doivent anonymiser ces données conformément à la nLPD/RGPD.
- Que se passe-t-il quand les chunks retournés par la recherche vectorielle ont tous un score de pertinence inférieur au seuil ? Le système refuse de générer une réponse et affiche "Aucun texte réglementaire trouvé" avec suggestion de reformuler.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT permettre à un utilisateur de poser une question en français sur la réglementation SST suisse et recevoir une réponse sourcée.
- **FR-002**: Chaque réponse DOIT citer la loi source, l'article exact, la date de version du texte et un lien vers le document officiel.
- **FR-003**: Le système DOIT afficher un disclaimer légal sur chaque réponse indiquant qu'il ne s'agit pas d'un avis juridique.
- **FR-004**: Le système DOIT couvrir l'intégralité des textes réglementaires SST Priorité 1 (OTConst, CFST 6508, OPA, OLT1-4) et Priorité 2 : 6 lois (LAA, LChim, LRS, LEg, LSPS, LIE), 11 ordonnances (OLT5, OChim, OPB, ORRChim, OICF, OIBT, OPair, OSPS, OMAle, OSEC, OPI), 14 directives CFST (6501, 6503, 1825, 6507, 6510, 6511, 6512, 6518, 2134, 6516, 6066, 6091) + ESTI 407, et 2 articles de code (CO art. 328, CP art. 229). Soit 39 sources au total.
- **FR-005**: Le système DOIT refuser de répondre lorsque le score de pertinence des chunks retournés est inférieur au seuil défini, et afficher "Aucun texte réglementaire trouvé" avec suggestion de reformuler.
- **FR-006**: Le système DOIT supporter une requête contextuelle depuis Securionis Inspect avec transmission automatique du thème SST actif.
- **FR-007**: Le système DOIT exposer un point d'entrée de requête (endpoint POST /api/quickref/query) acceptant une question, un contexte optionnel (thème, catégorie) et une langue, authentifié par JWT Supabase.
- **FR-008**: Le système DOIT limiter les requêtes à 10 par jour pour les utilisateurs non authentifiés (mode freemium).
- **FR-009**: Le système DOIT permettre un accès illimité aux utilisateurs du plan Pro ou du plan Securionis Premium/Enterprise.
- **FR-010**: La landing page publique DOIT afficher une interface de chat avec historique de conversation et affichage des sources.
- **FR-011**: Le système DOIT conserver en cache local les 50 dernières réponses pour consultation hors-ligne.
- **FR-012**: Le système DOIT fournir un mécanisme de feedback (pouce haut/bas) sur chaque réponse.
- **FR-013**: Les réponses DOIVENT être présentées sous forme de résumé court (3-5 lignes) avec option "Voir détail complet".
- **FR-014**: Le format de citation DOIT suivre le standard : [Source] Art. XX — Version JJ.MM.AAAA — [URL officielle].
- **FR-015**: Le système DOIT anonymiser toutes les données dans les logs de requêtes (conformité nLPD/RGPD).
- **FR-016**: Le système DOIT afficher un badge de fraîcheur indiquant la date de dernière mise à jour du texte référencé.
- **FR-017**: Le système DOIT vérifier l'intégrité des textes indexés via un mécanisme de hachage (SHA-256) pour garantir la traçabilité légale.
- **FR-018**: Le système DOIT conserver les versions antérieures des textes réglementaires mis à jour, marquées comme supersédées, consultables sur demande tout en priorisant la version courante par défaut.
- **FR-019**: Lorsque le service SST-QuickRef est indisponible, le bouton "Texte applicable" dans Securionis Inspect DOIT rester visible et proposer un lien direct vers le PDF source officiel en fallback.
- **FR-020**: Le périmètre fonctionnel couvre Phase 0 (POC RAG, ingestion, validation), Phase 1 (landing page chat, freemium, sources cliquables) et Phase 2 (API REST, intégration Securionis Inspect, veille réglementaire, logs anonymisés).

### Key Entities

- **Document réglementaire** : Un texte officiel suisse en matière de SST (loi, ordonnance, directive, fiche pratique). Attributs : source (OTConst, OPA, CFST, SUVA, SECO), article, date de version, URL officielle, langue, statut de supersession (is_superseded). Les versions antérieures sont conservées et marquées comme supersédées.
- **Chunk documentaire** : Un fragment sémantique d'un document réglementaire, optimisé pour la recherche. Attributs : contenu textuel, métadonnées source, vecteur d'embedding, hash d'intégrité (SHA-256), score de pertinence lors des requêtes.
- **Requête utilisateur** : Une question posée par un utilisateur avec contexte optionnel. Attributs : texte de la question (anonymisé), type d'utilisateur (inspector / admin / anonymous), sources citées dans la réponse, temps de réponse en millisecondes.
- **Session de consultation** : Un historique de questions-réponses lié à une session d'inspection. Attributs : liste de requêtes, cache local (50 dernières), timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les utilisateurs obtiennent une réponse à leur question réglementaire en moins de 3 secondes.
- **SC-002**: Plus de 95 % des réponses citent correctement la référence législative vérifiable (article, version, source).
- **SC-003**: 100 % des textes SST suisses Priorité 1 et Priorité 2 sont couverts et consultables — **ATTEINT : 39 sources, 4480 chunks** (étendu depuis 7 sources / 971 chunks). 3 directives CFST encore manquantes : 1907, 2135, 2314.
- **SC-004**: Les inspecteurs de terrain valident la pertinence des réponses sur un jeu de 50 questions de référence avec un taux de satisfaction supérieur à 80 %.
- **SC-005**: Le système supporte 1000 requêtes par mois sans dégradation de performance perceptible.
- **SC-006**: Le taux d'adoption atteint l'intégration active dans Securionis Inspect d'ici T3 2025.
- **SC-007**: 0 % de données personnelles identifiables dans les logs de requêtes (conformité nLPD/RGPD).
- **SC-008**: Disponibilité de 99,5 % en heures ouvrées (lundi-vendredi, 7h-18h). Fenêtres de maintenance autorisées hors de cette plage.
- **SC-009**: Taux de refus correct : 100 % des requêtes hors périmètre du corpus sont identifiées et refusées (pas de réponse hallucidée sur des sujets non couverts).

## Assumptions

- Les utilisateurs cibles sont des professionnels SST francophones travaillant sur des chantiers de construction en Suisse. Le support de l'allemand est prévu en Phase 3 et hors périmètre de cette spécification.
- L'infrastructure Supabase existante (utilisée par Securionis Inspect) sera réutilisée, avec activation de l'extension pgvector pour la recherche vectorielle.
- Les données OTConst et CFST sont déjà partiellement structurées dans Securionis, ce qui accélère l'ingestion initiale.
- Le disclaimer légal est une mesure de protection nécessaire et suffisante en l'absence de validation par un juriste SST externe (validation recommandée avant Phase 3).
- La politique de rétention des logs est fixée à 90 jours maximum, avec suppression automatique ensuite.
- L'authentification pour les utilisateurs Securionis repose sur le système JWT existant. L'accès freemium sur la landing page fonctionne sans authentification avec rate limiting.
- Les textes réglementaires Priorité 2 (lois, ordonnances, directives CFST) sont désormais intégrés (32 sources additionnelles, 4480 chunks). 3 directives CFST restent manquantes (1907, 2135, 2314). Les textes Priorité 3 (SIA 118, nLPD, AEAI, SUVA Fiches-info, SECO Instructions) sont hors périmètre initial et seront ingérés dans les phases ultérieures.
- Le périmètre couvre les Phases 0, 1 et 2 du rapport de développement. La Phase 3 (multi-langue, export PDF, tableau de bord admin) reste hors périmètre.
- Les métriques d'observabilité (temps de réponse, taux de citations, volume, erreurs) sont collectées en continu pour piloter la qualité du service.

## Implementation Status (2026-04-03)

### Deployed (2026-04-05)
- **Production URL** : https://quickref.securionis.com (VPS Hostinger, Docker + Nginx, SSL Let's Encrypt)
- **39 sources réglementaires** : 7 sources initiales (OTConst, CFST 6508, OPA, OLT1-4) + 32 nouvelles sources — 6 lois (LAA, LChim, LRS, LEg, LSPS, LIE), 11 ordonnances (OLT5, OChim, OPB, ORRChim, OICF, OIBT, OPair, OSPS, OMAle, OSEC, OPI), 14 directives CFST (6501, 6503, 1825, 6507, 6510, 6511, 6512, 6518, 2134, 6516, 6066, 6091) + ESTI 407, 2 articles de code (CO art. 328, CP art. 229) — **4480 chunks total**
- **Pipeline RAG** : OpenAI text-embedding-3-small → pgvector (Supabase) → Claude Sonnet → citations sourcées
- **Frontend** : Vue 3 + Vite + Tailwind, landing page, chat responsive mobile/desktop, sources cliquables
- **Backend** : 5 Supabase Edge Functions (quickref-query, quickref-feedback, stripe-checkout, stripe-webhook, session-update), 7 migrations SQL
- **Abonnement Stripe** : Plan Pro CHF 29/mois live, modale email → Stripe Checkout → webhook activation
- **Authentification** : Magic link via Supabase Auth (email → lien de connexion → connecté)
- **Session unique** : 1 seul appareil simultané par abonné (session_id vérifié, bannière si révoquée)
- **Rate limiting** : 10 req/jour freemium (IP), illimité pour abonnés Pro + admin
- **Badge Pro** : Visible pour abonnés actifs et admin, compteur requêtes masqué
- **Seuil de similarité** : 0.55 (calibré pour textes PDF réels, filtré au niveau RPC)
- **System prompt** : Langage naturel, comprend les questions informelles
- **Branding** : ©2026 - Securionis

### Security (2026-04-04 — Audit complet)
- **Modules sécurité actifs** : validate.ts (validation input), rate-limit.ts (10 req/jour IP), anonymize.ts (PII removal avant logging)
- **CORS restreint** : uniquement quickref.securionis.com et localhost:5173
- **Prompt injection** : question encadrée par délimiteurs `<user_question>`, instruction de sécurité dans le system prompt
- **Timing attack** : comparaison constant-time sur la clé admin
- **Client séparé** : anon key pour lectures RLS, service role uniquement pour INSERT logs
- **Anonymisation nLPD** : emails, téléphones, noms, adresses, entreprises supprimés avant logging
- **Nginx hardening** : HSTS, CSP complété (base-uri, form-action), Permissions-Policy, X-Frame-Options DENY
- **Source maps** désactivées en production
- **Dépendance pinnée** : @supabase/supabase-js@2.49.4
- **SECURITY DEFINER** avec search_path restreint sur fonctions SQL

### Pending
- Intégration bouton "Texte applicable" dans Securionis Inspect
- 3 directives CFST manquantes : 1907, 2135, 2314
- Sources additionnelles Priorité 3 : SUVA Fiches-info, SECO Instructions, SIA 118, nLPD, AEAI
- Multi-langue (allemand)
- Benchmark formel sur 50 questions de référence
- Nginx hardening à redéployer sur le VPS (deploy/nginx.conf mis à jour)
- Portail Stripe pour gérer/annuler l'abonnement
