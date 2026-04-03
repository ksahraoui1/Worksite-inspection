# Feature Specification: Controle Chantier — Inspection Securite OTConst/SUVA

**Feature Branch**: `001-controle-chantier`
**Created**: 2026-02-26
**Status**: Clarified
**Input**: User description: Application web Mobile-First pour la gestion et le controle de la sante et de la securite au travail sur les chantiers de construction en Suisse, conforme a l'OTConst et aux Regles vitales SUVA.

## Clarifications

### Session 2026-02-26

- Q: Quelle strategie de resolution de conflits pour la synchronisation hors-ligne ? → A: Last-write-wins avec priorite au timestamp serveur. Les ecarts STOP Danger ne sont jamais ecrases par une synchronisation offline.
- Q: Quel est le cycle de vie (state machine) d'un Ecart ? → A: Trois etats : "A corriger" → "Resolu" (resolution), "A corriger" → "STOP Danger" (escalade), "STOP Danger" → "A corriger" (de-escalade apres suppression du danger immediat), "STOP Danger" → "Resolu" (resolution directe). "Resolu" est un etat terminal (pas de reouverture ; creer un nouvel ecart si regression).
- Q: Quelle volumetrie de donnees prevoir pour le dimensionnement ? → A: Mono-tenant (une organisation). Jusqu'a 50 chantiers actifs simultanes, 500 visites par chantier sur sa duree de vie, 2000 ecarts par chantier. Environ 10 utilisateurs simultanes maximum.
- Q: Quelle duree de conservation des donnees (conformite suisse) ? → A: Minimum 10 ans pour les visites, ecarts et rapports, conforme aux obligations de conservation des documents de securite au travail en Suisse. Le soft-delete garantit qu'aucune donnee n'est physiquement supprimee.
- Q: Normalisation terminologique "Ecart" vs "Action corrective" ? → A: "Ecart" est le terme canonique pour le constat de non-conformite. "Action corrective" designe le processus de resolution mene par l'entreprise assignee, et non l'entite elle-meme.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Dashboard chantiers et alertes (Priority: P1)

En tant que responsable securite, je veux voir la liste de tous mes chantiers actifs avec les alertes sur les ecarts non resolus et en retard, afin de prioriser mes interventions quotidiennes.

**Why this priority**: C'est le point d'entree principal de l'application. Sans dashboard, aucune autre fonctionnalite n'est accessible de maniere structuree. C'est le MVP minimal qui apporte une valeur immediate.

**Independent Test**: Peut etre teste en creant 2-3 chantiers avec des ecarts en retard et en verifiant que le dashboard les affiche correctement avec les indicateurs visuels d'alerte.

**Acceptance Scenarios**:

1. **Given** l'utilisateur ouvre l'application, **When** il accede au dashboard, **Then** il voit la liste des chantiers actifs avec leur nom, adresse, responsable et statut.
2. **Given** un chantier a des ecarts dont le delai de resolution est depasse, **When** le dashboard s'affiche, **Then** une alerte visuelle (badge rouge) est visible sur ce chantier avec le nombre d'ecarts en retard.
3. **Given** l'utilisateur clique sur un chantier, **When** la page de detail s'ouvre, **Then** il voit l'historique chronologique de toutes les visites effectuees avec leur statut et les ecarts associes.
4. **Given** l'utilisateur est sur le detail d'un chantier, **When** il consulte la timeline, **Then** les visites sont ordonnees de la plus recente a la plus ancienne avec la phase evaluee et le nom de l'inspecteur.

---

### User Story 2 — Realisation d'une visite d'inspection (Priority: P1)

En tant qu'inspecteur securite sur le terrain, je veux selectionner un chantier et une phase de construction pour lancer une visite, repondre aux points de controle (Conforme / Non Conforme / Non Applicable), et documenter les ecarts avec photo et notes, afin de generer un constat d'inspection complet.

**Why this priority**: C'est le coeur fonctionnel de l'application — sans module d'inspection, l'outil n'a pas de raison d'etre. Priorise au meme niveau que le dashboard car les deux forment le MVP ensemble.

**Independent Test**: Peut etre teste en creant une visite sur un chantier existant, en repondant a tous les points de controle d'une phase, en documentant un ecart avec photo, et en verifiant que la visite apparait dans l'historique du chantier.

**Acceptance Scenarios**:

1. **Given** l'inspecteur est sur le detail d'un chantier, **When** il clique sur "Nouvelle visite", **Then** il peut selectionner la phase de construction a evaluer parmi les 5 phases standard.
2. **Given** une phase est selectionnee, **When** la checklist s'affiche, **Then** les points de controle sont specifiques a cette phase avec les references legales OTConst/SUVA visibles.
3. **Given** l'inspecteur repond a un point de controle, **When** il selectionne "Non Conforme", **Then** un formulaire d'ecart s'ouvre permettant de prendre une photo, dicter une note, selectionner l'entreprise responsable et definir un delai de resolution.
4. **Given** l'inspecteur repond "Non Conforme" et choisit le niveau "STOP Danger", **When** il valide l'ecart, **Then** le systeme notifie immediatement le responsable securite du chantier.
5. **Given** l'inspecteur a repondu a tous les points, **When** il termine la visite, **Then** la visite passe au statut "Terminee" et est visible dans l'historique du chantier.

---

### User Story 3 — Bouton STOP EN CAS DE DANGER (Priority: P1)

En tant que toute personne presente sur le chantier, je veux pouvoir declencher un arret d'urgence en un seul tap depuis n'importe quel ecran de l'application, afin d'interrompre immediatement une activite dangereuse conformement a la Regle fondamentale SUVA.

**Why this priority**: La securite des personnes est la priorite absolue. Ce mecanisme est une obligation SUVA et doit etre accessible en permanence.

**Independent Test**: Peut etre teste en naviguant sur differents ecrans de l'application et en verifiant que le bouton rouge est toujours visible et fonctionnel, et que l'activation envoie bien une notification.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est sur n'importe quel ecran, **When** il regarde l'interface, **Then** un bouton rouge "STOP DANGER" est visible en permanence.
2. **Given** l'utilisateur appuie sur le bouton STOP, **When** un formulaire rapide s'ouvre, **Then** il peut selectionner le chantier concerne, decrire brievement le danger et valider en un minimum de taps.
3. **Given** un STOP est declenche, **When** la validation est effectuee, **Then** le responsable securite du chantier recoit une notification immediate et l'ecart est cree avec le statut "STOP Danger".
4. **Given** un ecart "STOP Danger" est actif sur un chantier, **When** le dashboard est consulte, **Then** le chantier affiche une alerte visuelle critique distincte des ecarts standards.

---

### User Story 4 — Gestion des ecarts et suivi de resolution (Priority: P2)

En tant que responsable securite, je veux suivre l'etat de tous les ecarts constates, relancer les entreprises en retard et marquer les ecarts comme resolus, afin d'assurer la mise en conformite du chantier.

**Why this priority**: Le suivi des ecarts est essentiel pour la mise en conformite mais peut fonctionner initialement de maniere basique (liste filtrable) avant d'etre enrichi.

**Independent Test**: Peut etre teste en creant plusieurs ecarts avec differents statuts et delais, puis en verifiant le filtrage, le tri et la mise a jour de statut.

**Acceptance Scenarios**:

1. **Given** le responsable est sur le detail d'un chantier, **When** il consulte les ecarts, **Then** il voit la liste de tous les ecarts avec leur statut, entreprise assignee, delai et photo.
2. **Given** un ecart a un delai depasse, **When** la liste s'affiche, **Then** l'ecart est visuellement marque comme "en retard" avec le nombre de jours de retard.
3. **Given** le responsable verifie qu'un ecart est corrige, **When** il marque l'ecart comme "Resolu", **Then** le statut est mis a jour avec la date de resolution et l'ecart disparait des alertes.
4. **Given** une entreprise sous-traitante a plusieurs ecarts non resolus, **When** le responsable filtre par entreprise, **Then** il voit tous les ecarts assignes a cette entreprise sur ce chantier.

---

### User Story 5 — Generation de rapport PDF (Priority: P2)

En tant que responsable securite, je veux generer un rapport de visite au format PDF contenant tous les constats, photos des ecarts, references legales et delais de mise en conformite, afin de le transmettre aux autorites ou aux entreprises concernees.

**Why this priority**: La generation de rapports est necessaire pour la documentation officielle mais n'est pas bloquante pour l'utilisation quotidienne de l'application.

**Independent Test**: Peut etre teste en completant une visite avec des ecarts documentes, puis en generant le PDF et en verifiant qu'il contient toutes les informations attendues.

**Acceptance Scenarios**:

1. **Given** une visite est terminee, **When** le responsable clique sur "Generer rapport", **Then** un PDF est genere avec l'en-tete du chantier, la date, l'inspecteur et la phase evaluee.
2. **Given** la visite contenait des ecarts, **When** le PDF est genere, **Then** chaque ecart apparait avec sa photo, son constat, la reference legale OTConst/SUVA, l'entreprise assignee et le delai de resolution.
3. **Given** le PDF est genere, **When** l'utilisateur le telecharge, **Then** le fichier est nomme selon le format "[Date]-[NomChantier]-Visite-[Phase].pdf".

---

### User Story 6 — Gestion des chantiers et entreprises (Priority: P3)

En tant que responsable securite, je veux creer et gerer les fiches de chantiers et les entreprises sous-traitantes associees, afin de configurer le contexte avant de lancer des inspections.

**Why this priority**: C'est une fonctionnalite de configuration necessaire mais qui peut etre simplifiee dans un premier temps (formulaires basiques CRUD).

**Independent Test**: Peut etre teste en creant un chantier avec ses informations, en y associant des entreprises, et en verifiant que ces donnees sont disponibles lors de la creation d'une visite.

**Acceptance Scenarios**:

1. **Given** le responsable est sur le dashboard, **When** il clique sur "Nouveau chantier", **Then** un formulaire lui permet de saisir le nom, l'adresse, les dates, le responsable securite et le statut.
2. **Given** un chantier existe, **When** le responsable gere les entreprises, **Then** il peut ajouter ou retirer des entreprises sous-traitantes avec leur corps de metier et contact.
3. **Given** une entreprise est associee a un chantier, **When** un ecart est cree lors d'une visite, **Then** cette entreprise apparait dans la liste de selection pour l'assignation.

---

### Edge Cases

- Que se passe-t-il quand l'inspecteur perd la connexion reseau en pleine visite ? L'application DOIT sauvegarder localement et synchroniser a la reconnexion (mode hors-ligne PWA). En cas de conflit, la strategie last-write-wins avec priorite au timestamp serveur s'applique. Les ecarts STOP Danger ne sont jamais ecrases par une synchronisation offline.
- Que se passe-t-il quand la camera du peripherique n'est pas disponible ? L'ecart DOIT pouvoir etre sauvegarde sans photo, avec une mention "Photo manquante".
- Que se passe-t-il quand un chantier passe au statut "Termine" avec des ecarts non resolus ? Le systeme DOIT afficher un avertissement et demander confirmation avant de cloturer.
- Que se passe-t-il quand deux inspecteurs lancent une visite simultanee sur le meme chantier ? Les deux visites DOIVENT etre enregistrees independamment sans conflit.
- Que se passe-t-il quand un ecart "STOP Danger" est cree mais aucun responsable securite n'est assigne au chantier ? Le systeme DOIT afficher une erreur et empecher la creation du chantier sans responsable.
- Que se passe-t-il quand un ecart "Resolu" presente a nouveau un probleme ? "Resolu" est un etat terminal. Un nouvel ecart DOIT etre cree referençant le point de controle concerne.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le systeme DOIT afficher un dashboard listant tous les chantiers actifs avec des indicateurs visuels pour les ecarts en retard.
- **FR-002**: Le systeme DOIT permettre de creer, modifier et consulter des fiches chantiers avec les champs : nom, adresse, date debut, date fin prevue, responsable securite, statut.
- **FR-003**: Le systeme DOIT supporter la gestion des entreprises sous-traitantes avec une relation Many-to-Many vers les chantiers.
- **FR-004**: Le systeme DOIT permettre de creer une visite d'inspection en selectionnant un chantier et une phase de construction (parmi 5 phases prédefinies).
- **FR-005**: Le systeme DOIT generer dynamiquement les points de controle (checklist) en fonction de la phase selectionnee, avec les references OTConst/SUVA.
- **FR-006**: Le systeme DOIT permettre de repondre a chaque point de controle avec : Conforme, Non Conforme, Non Applicable.
- **FR-007**: Le systeme DOIT, lors d'une reponse "Non Conforme", permettre de creer un ecart avec : photo, note textuelle, entreprise assignee, delai de resolution, niveau de severite.
- **FR-008**: Le systeme DOIT afficher un bouton "STOP DANGER" rouge, persistant et accessible depuis n'importe quel ecran.
- **FR-009**: Le systeme DOIT envoyer une notification au responsable securite lors du declenchement d'un STOP Danger.
- **FR-010**: Le systeme DOIT afficher l'historique chronologique des visites pour chaque chantier.
- **FR-011**: Le systeme DOIT permettre de generer un rapport PDF pour chaque visite terminee.
- **FR-012**: Le systeme DOIT fonctionner en mode hors-ligne (PWA) et synchroniser les donnees a la reconnexion.
- **FR-013**: Le systeme DOIT pre-charger les 5 phases de construction et les points de controle OTConst/SUVA via un script de seed.
- **FR-014**: Le systeme DOIT interdire la cloture d'un chantier ayant des ecarts non resolus sans confirmation explicite.
- **FR-015**: Le systeme DOIT utiliser le soft-delete pour toutes les entites afin de garantir la tracabilite.
- **FR-016**: Le systeme DOIT conserver les donnees de visites, ecarts et rapports pendant un minimum de 10 ans, conforme aux obligations suisses de conservation des documents de securite au travail.
- **FR-017**: Le systeme DOIT appliquer une strategie last-write-wins (timestamp serveur prioritaire) pour la resolution de conflits lors de la synchronisation hors-ligne, avec protection des ecarts STOP Danger contre l'ecrasement.
- **FR-018**: Le systeme DOIT respecter le cycle de vie des ecarts : "A corriger" peut etre escalade en "STOP Danger" ou resolu en "Resolu" ; "STOP Danger" peut etre de-escalade en "A corriger" ou resolu en "Resolu" ; "Resolu" est un etat terminal sans reouverture possible.

### Key Entities

- **Chantier** : Represente un site de construction avec ses metadonnees (nom, adresse, dates, responsable). Point d'ancrage central du modele. Un chantier a plusieurs visites et est associe a plusieurs entreprises.
- **Entreprise** : Sous-traitant intervenant sur un ou plusieurs chantiers. Identifie par son corps de metier (Maconnerie, Charpente, Electricite, Peinture, etc.). Associe aux ecarts pour l'assignation des corrections.
- **Visite** : Enregistrement d'une inspection realisee sur un chantier a une date donnee, pour une phase de construction specifique. Contient les reponses aux points de controle et les ecarts constates.
- **ChecklistItem** : Point de controle predéfini associe a une phase de construction et optionnellement a un corps de metier. Contient la question et la reference legale (OTConst Art. XX / SUVA Regle Y).
- **Ecart** : Constat de non-conformite (terme canonique) lie a une visite et un point de controle. Documente avec photo, texte, entreprise responsable, delai et severite. Cycle de vie : "A corriger" → "Resolu" | "A corriger" → "STOP Danger" (escalade) | "STOP Danger" → "A corriger" (de-escalade) | "STOP Danger" → "Resolu". "Resolu" est un etat terminal.
- **ReponseVisite** : Reponse de l'inspecteur a un point de controle lors d'une visite specifique (Conforme / Non Conforme / Non Applicable). Relie la visite au point de controle.
- **ChantierEntreprise** : Table de jointure Many-to-Many entre chantiers et entreprises.

## Assumptions

- L'application est monolingue francais (pas d'internationalisation dans cette version).
- L'authentification est geree par Supabase Auth avec connexion email/mot de passe. Pas de SSO ni OAuth tiers dans cette version.
- Les notifications "STOP Danger" seront envoyees par email (via Resend) dans un premier temps. Les notifications push pourront etre ajoutees ulterieurement.
- Les photos sont stockees dans Supabase Storage et referencees par URL dans les ecarts.
- Le mode hors-ligne utilise IndexedDB (Dexie.js) pour le cache local, avec synchronisation automatique via le Service Worker (Serwist) a la reconnexion.
- Les donnees de seed (phases et points de controle) sont considerees comme des donnees de reference immuables dans cette version. L'administration des checklists personnalisees est hors scope.
- Un seul role utilisateur existe dans cette version : "Responsable securite / Inspecteur". La gestion fine des roles et permissions est hors scope.
- Les rapports PDF sont generes cote client via @react-pdf/renderer.
- Volumetrie cible : mono-tenant (une organisation), jusqu'a 50 chantiers actifs simultanes, 500 visites par chantier, 2000 ecarts par chantier, 10 utilisateurs simultanes maximum.
- Conservation des donnees : minimum 10 ans (obligation suisse documents securite). Soft-delete garantit qu'aucune donnee n'est physiquement supprimee.
- Terminologie : "Ecart" est le terme canonique pour le constat de non-conformite. "Action corrective" designe le processus de resolution, pas l'entite.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un inspecteur peut completer une visite d'inspection de bout en bout (selection chantier + phase, reponse aux points de controle, creation d'ecart avec photo) en moins de 10 minutes sur un smartphone.
- **SC-002**: Le dashboard affiche correctement les chantiers actifs et les alertes d'ecarts en retard dans un delai de 2 secondes apres chargement.
- **SC-003**: Le bouton STOP Danger est accessible en 1 seul tap depuis n'importe quel ecran de l'application et declenche une notification dans les 30 secondes.
- **SC-004**: L'application reste fonctionnelle en mode hors-ligne : l'inspecteur peut realiser une visite complete sans connexion, et les donnees se synchronisent automatiquement a la reconnexion.
- **SC-005**: Le rapport PDF genere contient 100% des informations de la visite : en-tete chantier, phase, inspecteur, date, tous les points de controle avec leurs reponses, et les ecarts avec photos et references legales.
- **SC-006**: 100% des points de controle du seed contiennent une reference legale OTConst ou SUVA valide.
- **SC-007**: L'interface est utilisable et lisible sur un ecran de 360px de large (smartphone standard) sans defilement horizontal.
