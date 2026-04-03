-- Seed: 5 phases de construction + 12 checklist items OTConst/SUVA

-- Phase 1: Préparation et installation
INSERT INTO phase (numero, nom, description) VALUES
(1, 'Préparation et installation', 'Phase initiale du chantier : plan de sécurité, vérifications préliminaires, clôtures et signalisation.');

-- Phase 2: Fouilles et terrassements
INSERT INTO phase (numero, nom, description) VALUES
(2, 'Fouilles et terrassements', 'Génie civil : sécurisation des fouilles, voies de circulation pour machines et engins.');

-- Phase 3: Gros œuvre
INSERT INTO phase (numero, nom, description) VALUES
(3, 'Gros œuvre', 'Maçonnerie et béton : protection contre les chutes, sécurisation des ouvertures, levage des charges.');

-- Phase 4: Enveloppe
INSERT INTO phase (numero, nom, description) VALUES
(4, 'Enveloppe', 'Façades, charpente et toiture : échafaudages, contrôles visuels quotidiens.');

-- Phase 5: Second œuvre
INSERT INTO phase (numero, nom, description) VALUES
(5, 'Second œuvre', 'Électricité, peinture, menuiserie : équipements de travail sûrs, installations électriques conformes.');

-- Checklist items Phase 1 (3 items)
INSERT INTO checklist_item (phase_id, corps_metier, question, reference_legale, ordre) VALUES
((SELECT id FROM phase WHERE numero = 1), NULL,
 'Le plan de sécurité et de protection de la santé est-il présent et accessible sur le chantier ?',
 'OTConst Art. 4', 1),
((SELECT id FROM phase WHERE numero = 1), NULL,
 'La présence d''amiante a-t-elle été vérifiée pour les bâtiments construits avant 1990 ?',
 'SUVA - Règle amiante', 2),
((SELECT id FROM phase WHERE numero = 1), NULL,
 'Les clôtures et la signalisation sont-elles en place pour empêcher l''accès au public ?',
 'OTConst Art. 3', 3);

-- Checklist items Phase 2 (2 items)
INSERT INTO checklist_item (phase_id, corps_metier, question, reference_legale, ordre) VALUES
((SELECT id FROM phase WHERE numero = 2), 'Génie civil',
 'Les fouilles et terrassements de plus de 1,5 m de profondeur sont-ils sécurisés (blindage, talutage) ?',
 'OTConst Art. 68 / SUVA', 1),
((SELECT id FROM phase WHERE numero = 2), 'Génie civil',
 'Les voies de circulation sont-elles sécurisées pour les machines et engins de chantier ?',
 'OTConst Art. 19', 2);

-- Checklist items Phase 3 (3 items)
INSERT INTO checklist_item (phase_id, corps_metier, question, reference_legale, ordre) VALUES
((SELECT id FROM phase WHERE numero = 3), 'Maçonnerie',
 'Les zones dangereuses sont-elles sécurisées dès 2 m de hauteur de chute (garde-corps périphériques) ?',
 'OTConst Art. 15 / SUVA Règle vitale', 1),
((SELECT id FROM phase WHERE numero = 3), 'Maçonnerie',
 'Toutes les ouvertures dans les sols sont-elles couvertes par des couvertures résistantes à la rupture ?',
 'OTConst Art. 22', 2),
((SELECT id FROM phase WHERE numero = 3), 'Maçonnerie',
 'Le levage des charges est-il effectué avec un élingage correct et le permis de grutier est-il vérifié ?',
 'OTConst Art. 75 / SUVA', 3);

-- Checklist items Phase 4 (2 items)
INSERT INTO checklist_item (phase_id, corps_metier, question, reference_legale, ordre) VALUES
((SELECT id FROM phase WHERE numero = 4), 'Charpente',
 'L''échafaudage de façade est-il installé conformément aux normes dès 3 m de hauteur de chute ?',
 'OTConst Art. 26', 1),
((SELECT id FROM phase WHERE numero = 4), 'Charpente',
 'Le contrôle visuel quotidien des échafaudages est-il effectué et documenté ?',
 'OTConst Art. 61', 2);

-- Checklist items Phase 5 (2 items)
INSERT INTO checklist_item (phase_id, corps_metier, question, reference_legale, ordre) VALUES
((SELECT id FROM phase WHERE numero = 5), 'Électricité',
 'Les équipements de travail sûrs (PIRL, échafaudages roulants) sont-ils utilisés au lieu d''échelles simples ?',
 'SUVA - Règle vitale échelles', 1),
((SELECT id FROM phase WHERE numero = 5), 'Électricité',
 'Les installations électriques utilisent-elles exclusivement des prises avec disjoncteur différentiel (DDR/FI) ?',
 'SUVA - Règle électricité / NIBT', 2);
