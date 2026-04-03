# Checklist Qualite des Exigences : Analyse Approfondie

**Purpose**: Valider la qualite, completude et coherence des exigences sur 4 domaines critiques : Conformite OTConst/SUVA, UX Mobile/Terrain, Hors-ligne/Synchronisation, Securite STOP Danger
**Created**: 2026-02-27
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [constitution v1.1.0](../../../.specify/memory/constitution.md)
**Depth**: Approfondi (40 items)
**Audience**: Reviewer (PR / pre-production)

---

## Conformite OTConst/SUVA

- [ ] CHK001 - Les 5 phases de construction sont-elles toutes listees avec leurs references OTConst/SUVA respectives dans les exigences fonctionnelles ? [Completeness, Spec §FR-005/FR-013]
- [ ] CHK002 - Les seuils reglementaires numeriques (1,5m fouilles, 2m chutes, 3m echafaudages) sont-ils explicitement documentes dans la spec comme criteres d'acceptation ? [Clarity, Constitution §I]
- [ ] CHK003 - La contrainte NOT NULL sur `reference_legale` des checklist items est-elle formulee comme exigence fonctionnelle dans la spec, ou seulement dans le plan technique ? [Gap, Constitution §I vs Spec §FR-005]
- [ ] CHK004 - Le nombre exact de points de controle par phase est-il specifie dans la spec (3+2+3+2+2=12), ou est-il seulement inferable du seed ? [Completeness, Spec §FR-013]
- [ ] CHK005 - Les exigences mentionnent-elles un mecanisme de validation que les references legales inserees sont correctes et a jour ? [Gap]
- [ ] CHK006 - L'exigence de verification de l'amiante pour les batiments d'avant 1990 est-elle formulee comme un critere conditionnel clair (date de construction < 1990) ? [Clarity, Constitution §I]
- [ ] CHK007 - Les exigences definissent-elles ce qui se passe si une reglementation OTConst/SUVA est mise a jour apres le deploiement ? [Edge Case, Gap]
- [ ] CHK008 - La correspondance entre corps de metier et phases est-elle documentee dans la spec, ou seulement implicite dans le seed ? [Completeness, Spec §FR-005]
- [ ] CHK009 - Le terme "Regles vitales SUVA" est-il defini avec precision (quelles regles exactement, quels numeros) ou reste-t-il vague ? [Ambiguity, Spec §FR-005]
- [ ] CHK010 - La conservation 10 ans (FR-016) est-elle accompagnee d'exigences sur le format de stockage long terme, la migration de donnees ou l'archivage ? [Completeness, Spec §FR-016]

## UX Mobile & Terrain

- [ ] CHK011 - Les exigences de taille minimale des zones tactiles (44px) sont-elles specifiees pour TOUS les elements interactifs (boutons, selects, checkboxes, liens) ? [Coverage, Constitution §II]
- [ ] CHK012 - Les 3 breakpoints (360px, 768px, 1024px) sont-ils accompagnes de specifications de mise en page pour chaque resolution ? [Clarity, Constitution §II]
- [ ] CHK013 - Les exigences definissent-elles le comportement de l'interface quand la camera du peripherique n'est pas disponible ? [Edge Case, Spec §Edge Cases]
- [ ] CHK014 - Le terme "alerte visuelle critique distincte des ecarts standards" (US-3) est-il defini avec des criteres visuels mesurables (couleur, taille, animation) ? [Ambiguity, Spec §US-3]
- [ ] CHK015 - Les exigences de capture photo specfient-elles les limites de taille, resolution maximale et format accepte ? [Gap, plan.md photo-compress.ts]
- [ ] CHK016 - La specification mentionne-t-elle un comportement pour le formulaire d'inspection en orientation paysage vs portrait ? [Gap]
- [ ] CHK017 - Les exigences d'accessibilite (contraste, taille de police, lecteur d'ecran) sont-elles documentees pour l'usage terrain en conditions de luminosite variable ? [Gap, Coverage]
- [ ] CHK018 - Le terme "interface fluide" (US-2) est-il quantifie avec des metriques mesurables (temps de reponse, nombre de taps, fluidite des transitions) ? [Ambiguity, Spec §US-2]
- [ ] CHK019 - Les exigences definissent-elles la hierarchie visuelle entre le bouton STOP Danger et les autres elements d'interface (z-index, position, overlap) ? [Clarity, Spec §FR-008]
- [ ] CHK020 - L'absence d'exigences pour le swipe et la dictee vocale est-elle clairement documentee comme "post-MVP" dans la spec (et pas seulement dans la constitution) ? [Consistency, Constitution §II vs Spec]

## Hors-ligne & Synchronisation

- [ ] CHK021 - La strategie last-write-wins (FR-017) definit-elle precisement quels champs sont compares pour determiner le "dernier ecrit" (timestamp serveur seul ou combinaison) ? [Clarity, Spec §FR-017]
- [ ] CHK022 - Les exigences specfient-elles le comportement de l'UI quand une synchronisation est en cours (indicateur, blocage des actions, feedback) ? [Gap, Spec §FR-012]
- [ ] CHK023 - La protection des ecarts STOP Danger contre l'ecrasement offline est-elle definie avec un scenario d'acceptation testable ? [Measurability, Spec §FR-017]
- [ ] CHK024 - Les exigences definissent-elles le volume maximal de donnees stockables localement en mode hors-ligne (quota IndexedDB) ? [Gap]
- [ ] CHK025 - Le comportement en cas d'echec de synchronisation est-il specifie (nombre de tentatives, backoff, notification utilisateur, donnees perdues) ? [Coverage, Gap]
- [ ] CHK026 - Les exigences de sync couvrent-elles les photos (upload vers Supabase Storage en arriere-plan) ou seulement les donnees textuelles ? [Completeness, Spec §FR-012]
- [ ] CHK027 - La strategie de resolution de conflit pour les Visites elles-memes (pas seulement les ecarts) est-elle documentee ? [Gap, Spec §FR-017]
- [ ] CHK028 - Les exigences definissent-elles ce qui se passe quand l'utilisateur tente de generer un PDF en mode hors-ligne ? [Edge Case, Gap]
- [ ] CHK029 - Le polling de synchronisation (30s mentionne dans le plan) est-il specifie comme exigence dans la spec, ou seulement comme choix d'implementation ? [Traceability, plan.md vs Spec §FR-012]
- [ ] CHK030 - Les exigences couvrent-elles le scenario ou deux utilisateurs modifient le meme ecart offline simultanement ? [Edge Case, Spec §FR-017]

## Securite STOP Danger

- [ ] CHK031 - L'exigence "1 seul tap" (SC-003) est-elle coherente avec le formulaire rapide qui demande de selectionner un chantier et decrire le danger (US-3) ? [Consistency, Spec §SC-003 vs §US-3]
- [ ] CHK032 - Le "gel de la zone/activite" mentionne dans la constitution est-il traduit en exigence fonctionnelle concrete dans la spec ? [Gap, Constitution §IV vs Spec]
- [ ] CHK033 - Les transitions de la state machine ecart (FR-018) sont-elles toutes documentees avec des scenarios d'acceptation testables ? [Measurability, Spec §FR-018]
- [ ] CHK034 - L'exigence de notification "immediate" (FR-009) est-elle coherente avec le seuil de 30 secondes (SC-003) ? [Consistency, Spec §FR-009 vs §SC-003]
- [ ] CHK035 - Les exigences definissent-elles ce qui se passe quand le STOP Danger est declenche en mode hors-ligne (notification differee, comportement local) ? [Edge Case, Gap]
- [ ] CHK036 - L'interdiction de reouverture d'un ecart "Resolu" (FR-018) est-elle accompagnee d'une exigence sur le message d'erreur affiche a l'utilisateur ? [Completeness, Spec §FR-018]
- [ ] CHK037 - Les exigences specfient-elles qui recoit la notification STOP Danger quand le responsable securite n'est pas assigne (edge case mentionne mais pas formalise en FR) ? [Gap, Spec §Edge Cases]
- [ ] CHK038 - Le mecanisme de "de-escalade" (STOP Danger → A corriger) est-il accompagne d'exigences sur les conditions de de-escalade et la traçabilite ? [Completeness, Spec §FR-018]
- [ ] CHK039 - Les exigences definissent-elles le comportement du bouton STOP quand une requete est deja en cours d'envoi (double-tap protection) ? [Edge Case, Gap]
- [ ] CHK040 - L'exigence "bloquer la poursuite des travaux concernes" (Constitution §IV) est-elle traduite en un comportement applicatif concret dans la spec ? [Gap, Constitution §IV vs Spec]

## Cross-Domain : Coherence & Traçabilite

- [ ] CHK041 - Les exigences d'authentification (login, logout, expiration de session) sont-elles documentees dans un FR dedie, ou seulement mentionnees en hypothese ? [Gap, Spec §Assumptions]
- [ ] CHK042 - Le mecanisme de "relance des entreprises en retard" (US-4) est-il formalise en exigence fonctionnelle avec un comportement defini ? [Gap, Spec §US-4]
- [ ] CHK043 - Les exigences de filtrage des ecarts par entreprise (US-4 scenario 4) sont-elles documentees comme FR dedie ou seulement dans un scenario d'acceptation ? [Traceability, Spec §US-4]
- [ ] CHK044 - Un objectif de couverture de tests est-il defini dans les exigences ou le plan ? [Gap]
- [ ] CHK045 - Les exigences RLS (Row Level Security) sont-elles formalisees dans la spec, ou seulement dans les migrations techniques ? [Gap, plan.md migration 008]

## Notes

- 45 items generes couvrant les 4 domaines + coherence cross-domain
- Priorite : Les items CHK032, CHK035, CHK037, CHK040 (STOP Danger gaps) et CHK021-CHK030 (sync) representent les zones de risque les plus elevees
- Les items marques [Gap] identifient des exigences absentes de la spec qu'il faudrait ajouter ou explicitement exclure
- Les items marques [Ambiguity] identifient des termes vagues necessitant une quantification
- Les items marques [Consistency] identifient des contradictions potentielles entre artefacts
