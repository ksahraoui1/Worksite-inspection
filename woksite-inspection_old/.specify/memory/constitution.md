<!--
  === Sync Impact Report ===
  Version change: 1.0.0 → 1.1.0
  Modified principles:
    - II. Mobile-First et Usage Terrain: "Dictee vocale" et "gestes de swipe"
      reclasses de DOIT vers DEVRAIT (ameliorations post-MVP)
    - III. Tracabilite Chronologique Complete: exportabilite precisee —
      le rapport PDF par visite satisfait l'exigence pour le MVP
  Added sections: N/A
  Removed sections: N/A
  Stack changes:
    - Retrait de "react-signature-canvas" et "react-email" (non utilises)
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ compatible
    - .specify/templates/spec-template.md — ✅ compatible
    - .specify/templates/tasks-template.md — ✅ compatible
  Follow-up TODOs: None
-->

# WokSite Inspection Constitution

## Core Principles

### I. Conformite OTConst/SUVA (NON-NEGOTIABLE)

Toute fonctionnalite implementee DOIT respecter les exigences de
l'Ordonnance sur les travaux de construction (OTConst) et les Regles
vitales de la SUVA. Les references legales suivantes sont obligatoires
dans le modele de donnees :

- OTConst Art. 4 : Plan de securite et de protection de la sante
- OTConst Art. 26 : Echafaudages de facade des 3 m de hauteur de chute
- OTConst Art. 61 : Controle visuel quotidien des echafaudages
- OTConst Art. 68 : Securisation des fouilles des 1,5 m de profondeur
- SUVA : Regles vitales par corps de metier, verification amiante
  pour batiments d'avant 1990, seuil de 2 m pour protection contre
  les chutes

Chaque point de controle (checklist item) DOIT inclure une reference
a l'article reglementaire correspondant. Aucune checklist ne peut etre
deployee sans reference legale validee.

### II. Mobile-First et Usage Terrain

L'application DOIT etre concue prioritairement pour une utilisation
sur tablette et smartphone directement sur le chantier :

- Design responsive Mobile-First obligatoire (breakpoints : mobile
  360px, tablette 768px, desktop 1024px)
- Mode hors-ligne OBLIGATOIRE via PWA (Service Worker + IndexedDB)
  pour les zones de chantier sans couverture reseau
- Interface tactile optimisee : boutons min 44px, zones de tap
  espacees
- Capture photo integree directement depuis l'interface d'inspection

Ameliorations post-MVP (DEVRAIT) :

- Gestes de swipe pour la navigation entre points de controle
- Dictee vocale pour la saisie des constats sur le terrain

### III. Tracabilite Chronologique Complete

Chaque action dans l'application DOIT etre horodatee et rattachee
a son contexte (chantier, visite, phase, inspecteur) :

- Historique complet par chantier : toutes les visites, ecarts et
  resolutions DOIVENT etre consultables chronologiquement
- Aucune suppression physique : les enregistrements DOIVENT utiliser
  un soft-delete pour garantir l'integrite de l'audit trail
- Generation de rapports PDF avec horodatage, photos des ecarts,
  references legales et delais de mise en conformite
- Les donnees DOIVENT etre exportables pour les autorites de controle.
  Pour le MVP, la generation de rapports PDF par visite (incluant
  constats, photos, references legales et delais) satisfait cette
  exigence. Un export general (CSV/JSON) DEVRAIT etre ajoute
  ulterieurement

### IV. Securite Immediate — STOP Danger

Le mecanisme STOP EN CAS DE DANGER (Regle fondamentale SUVA) DOIT
etre accessible en permanence depuis n'importe quel ecran :

- Bouton rouge persistant visible sur toute l'application
- Activation en un seul tap (pas de confirmation intermediaire pour
  le declenchement)
- Notification immediate au responsable securite du chantier
- Gel de la zone/activite concernee dans le systeme jusqu'a
  resolution explicite
- Le statut "STOP Danger" sur un ecart est le niveau de severite
  le plus eleve et DOIT bloquer la poursuite des travaux concernes

### V. Architecture par Phases de Construction

Le modele de donnees et l'interface utilisateur DOIVENT refleter
les 5 phases standard de construction suisse :

1. **Phase 1** : Preparation et installation
2. **Phase 2** : Fouilles et terrassements (Genie civil)
3. **Phase 3** : Gros oeuvre (Maconnerie, Beton)
4. **Phase 4** : Enveloppe (Facades, Charpente, Toiture)
5. **Phase 5** : Second oeuvre (Electricite, Peinture, Menuiserie)

Les checklists DOIVENT etre generees dynamiquement en fonction de la
phase selectionnee lors de la visite. Chaque phase possede ses propres
points de controle specifiques avec les references OTConst/SUVA
correspondantes. Le script de seed DOIT contenir l'integralite des
points de controle decrits dans la specification initiale.

## Contraintes Reglementaires et Modele de Donnees

Le schema de base de donnees DOIT implementer les entites suivantes
avec leurs relations :

- **Chantier** : ID, Nom, Adresse, Date debut, Date fin prevue,
  Responsable securite, Statut (Actif/Termine)
- **Entreprise** (sous-traitants) : ID, Nom, Corps de metier,
  Contact — relation Many-to-Many avec Chantier
- **Visite** : ID, ID_Chantier, Date/Heure, Phase evaluee,
  Inspecteur, Statut (En cours/Terminee)
- **ChecklistItem** (points de controle) : ID, Phase associee,
  Corps de metier, Question, Reference legale (OTConst/SUVA)
- **Ecart** (action corrective) : ID, ID_Visite,
  ID_PointDeControle, Constat, Photo URL, Entreprise assignee,
  Delai de resolution, Statut (A corriger / STOP Danger / Resolu)
- **ReponseVisite** : ID, ID_Visite, ID_ChecklistItem, Resultat
  (Conforme / Non Conforme / Non Applicable)

Stack technologique validee :

- **Frontend** : Next.js 14+ (App Router), React 18+, TypeScript 5.x
  (strict mode), Tailwind CSS
- **Backend/BDD** : Supabase (PostgreSQL), Supabase JS v2
- **PWA** : Serwist (Service Worker), Dexie.js 4.x (IndexedDB)
- **PDF** : @react-pdf/renderer v4
- **Notifications** : Resend

## Workflow de Developpement

Le developpement DOIT suivre un processus pas-a-pas avec validation
utilisateur entre chaque etape majeure :

1. **Proposition de stack** : Presenter la stack et attendre
   validation avant tout code
2. **Initialisation** : Creer le projet, installer les dependances
3. **Schema BDD** : Generer le schema avec toutes les entites et
   relations definies ci-dessus
4. **Script de seed** : Peupler la base avec les 5 phases et tous
   les points de controle OTConst/SUVA
5. **Dashboard** : Developper la liste des chantiers actifs et la
   vue detail avec historique chronologique
6. **Module d'inspection** : Formulaire de visite interactif avec
   gestion des ecarts et actions correctives
7. **Questions** : Poser toute question d'architecture AVANT de
   coder

Chaque fonctionnalite UI DOIT inclure :

- Le Dashboard avec alertes sur les ecarts en retard
- Le bouton STOP Danger accessible sur chaque ecran
- Le formulaire d'inspection (Conforme/Non Conforme/N-A)
- Le module de creation d'ecart (photo, note, assignation)
- La vue historique chronologique par chantier
- La generation de rapport PDF

## Governance

Cette constitution est le document de reference supreme pour le
projet WokSite Inspection. Toute decision d'architecture ou
d'implementation DOIT etre verifiee contre ces principes.

- **Amendements** : Toute modification de cette constitution
  necessite une documentation explicite du changement, une
  justification et une mise a jour du numero de version
- **Versioning** : MAJOR pour suppression/redefinition de principes,
  MINOR pour ajout de principes ou expansion materielle,
  PATCH pour clarifications et corrections mineures
- **Conformite** : Toute PR/review DOIT verifier la conformite avec
  les principes ci-dessus. Les references OTConst/SUVA ne peuvent
  pas etre supprimees ou modifiees sans justification reglementaire
- **Guidance** : Consulter `CLAUDE.md` pour les directives de
  developpement runtime specifiques au projet

**Version**: 1.1.0 | **Ratified**: 2026-02-26 | **Last Amended**: 2026-02-27
