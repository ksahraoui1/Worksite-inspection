/**
 * Registre des documents réglementaires SST suisses à ingérer dans le RAG.
 * Chaque entrée contient les métadonnées nécessaires au parsing et à l'upload.
 */

export interface DocumentEntry {
  /** Identifiant unique (nom court) */
  id: string
  /** Type de document */
  type: 'loi' | 'ordonnance' | 'directive' | 'code'
  /** Référence officielle (RS, CFST, etc.) */
  reference: string
  /** Nom complet */
  name: string
  /** Nom du fichier PDF dans data/ */
  filename: string
  /** Source utilisée dans la DB (colonne source) */
  source: string
  /** Date de version */
  versionDate: string
  /** URL de référence */
  sourceUrl: string
  /** URL de téléchargement du PDF (fedlex, ekas, etc.) */
  downloadUrl: string
  /** Pattern de découpage (regex) — défaut: Art.\s*\d+ */
  splitPattern?: RegExp
  /** Contenu inline (pour les articles isolés comme CO art. 328) */
  inlineContent?: string
}

/**
 * Documents déjà ingérés (pour référence, ne pas re-traiter)
 */
export const EXISTING_SOURCES = [
  'OTConst',    // RS 832.311.141
  'CFST_6508',  // Directive CFST 6508
  'OPA',        // RS 832.30
  'OLT1',       // RS 822.111
  'OLT2',       // RS 822.112
  'OLT3',       // RS 822.113
  'OLT4',       // RS 822.114
]

/**
 * 32 nouveaux documents à ingérer
 */
export const NEW_DOCUMENTS: DocumentEntry[] = [
  // ===== LOIS =====
  {
    id: 'laa',
    type: 'loi',
    reference: 'RS 832.20',
    name: 'Loi fédérale sur l\'assurance-accidents',
    filename: 'laa.pdf',
    source: 'LAA',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1982/1676_1676_1676/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/1982/1676_1676_1676/fr/pdf-a',
  },
  {
    id: 'lchim',
    type: 'loi',
    reference: 'RS 813.1',
    name: 'Loi sur les produits chimiques',
    filename: 'lchim.pdf',
    source: 'LChim',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2004/724/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2004/724/fr/pdf-a',
  },
  {
    id: 'lrs',
    type: 'loi',
    reference: 'RS 814.50',
    name: 'Loi sur la radioprotection',
    filename: 'lrs.pdf',
    source: 'LRS',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1994/1933_1933_1933/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/1994/1933_1933_1933/fr/pdf-a',
  },
  {
    id: 'leg',
    type: 'loi',
    reference: 'RS 151.1',
    name: 'Loi sur l\'égalité (inclut harcèlement sexuel/SST)',
    filename: 'leg.pdf',
    source: 'LEg',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1996/1498_1498_1498/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/1996/1498_1498_1498/fr/pdf-a',
  },
  {
    id: 'lsps',
    type: 'loi',
    reference: 'RS 930.11',
    name: 'Loi sur la sécurité des produits',
    filename: 'lsps.pdf',
    source: 'LSPS',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2010/347/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2010/347/fr/pdf-a',
  },
  {
    id: 'lie',
    type: 'loi',
    reference: 'RS 734.0',
    name: 'Loi sur les installations électriques',
    filename: 'lie.pdf',
    source: 'LIE',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/19/252_271_281/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/19/252_271_281/fr/pdf-a',
  },

  // ===== ORDONNANCES =====
  {
    id: 'olt5',
    type: 'ordonnance',
    reference: 'RS 822.115',
    name: 'Protection des jeunes travailleurs',
    filename: 'olt5.pdf',
    source: 'OLT5',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2007/692/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2007/692/fr/pdf-a',
  },
  {
    id: 'ochim',
    type: 'ordonnance',
    reference: 'RS 813.11',
    name: 'Ordonnance sur les produits chimiques',
    filename: 'ochim.pdf',
    source: 'OChim',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2005/478/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2005/478/fr/pdf-a',
  },
  {
    id: 'opb',
    type: 'ordonnance',
    reference: 'RS 814.41',
    name: 'Ordonnance sur la protection contre le bruit',
    filename: 'opb.pdf',
    source: 'OPB',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1987/338_338_338/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/1987/338_338_338/fr/pdf-a',
  },
  {
    id: 'orrchim',
    type: 'ordonnance',
    reference: 'RS 814.81',
    name: 'Réduction des risques liés aux produits chimiques',
    filename: 'orrchim.pdf',
    source: 'ORRChim',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2005/477/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2005/477/fr/pdf-a',
  },
  {
    id: 'oicf',
    type: 'ordonnance',
    reference: 'RS 734.2',
    name: 'Ordonnance sur le courant fort',
    filename: 'oicf.pdf',
    source: 'OICF',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2001/475/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2001/475/fr/pdf-a',
  },
  {
    id: 'oibt',
    type: 'ordonnance',
    reference: 'RS 734.27',
    name: 'Installations électriques à basse tension',
    filename: 'oibt.pdf',
    source: 'OIBT',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2002/26/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2002/26/fr/pdf-a',
  },
  {
    id: 'opair',
    type: 'ordonnance',
    reference: 'RS 814.31',
    name: 'Ordonnance sur la pollution de l\'air',
    filename: 'opair.pdf',
    source: 'OPair',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1986/208_208_208/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/1986/208_208_208/fr/pdf-a',
  },
  {
    id: 'osps',
    type: 'ordonnance',
    reference: 'RS 930.111',
    name: 'Ordonnance sur la sécurité des produits',
    filename: 'osps.pdf',
    source: 'OSPS',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2010/348/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2010/348/fr/pdf-a',
  },
  {
    id: 'omales',
    type: 'ordonnance',
    reference: 'RS 832.312.11',
    name: 'Ordonnance sur les machines (sécurité)',
    filename: 'omales.pdf',
    source: 'OMAle',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2008/232/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2008/232/fr/pdf-a',
  },
  {
    id: 'osec',
    type: 'ordonnance',
    reference: 'RS 832.312.12',
    name: 'Équipements sous pression',
    filename: 'osec.pdf',
    source: 'OSEC',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/1999/404/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/1999/404/fr/pdf-a',
  },
  {
    id: 'opi',
    type: 'ordonnance',
    reference: 'RS 832.311.12',
    name: 'Utilisation des équipements de protection individuelle',
    filename: 'opi.pdf',
    source: 'OPI',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/2001/370/fr',
    downloadUrl: 'https://www.fedlex.admin.ch/eli/cc/2001/370/fr/pdf-a',
  },

  // ===== DIRECTIVES CFST =====
  {
    id: 'cfst-6501',
    type: 'directive',
    reference: 'CFST 6501',
    name: 'Équipements de protection individuelle',
    filename: 'cfst6501.pdf',
    source: 'CFST_6501',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=6501',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Section\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-6503',
    type: 'directive',
    reference: 'CFST 6503',
    name: 'Échelles et marchepieds',
    filename: 'cfst6503.pdf',
    source: 'CFST_6503',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=6503',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-6505',
    type: 'directive',
    reference: 'CFST 1825',
    name: 'Liquides inflammables — Entreposage et manipulation',
    filename: 'cfst6505.pdf',
    source: 'CFST_1825',
    versionDate: '2005-05-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=1825',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-6507',
    type: 'directive',
    reference: 'CFST 6507',
    name: 'Gaz liquéfiés',
    filename: 'cfst6507.pdf',
    source: 'CFST_6507',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=6507',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-6510',
    type: 'directive',
    reference: 'CFST 6510',
    name: 'Maintenance',
    filename: 'cfst6510.pdf',
    source: 'CFST_6510',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=6510',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-6511',
    type: 'directive',
    reference: 'CFST 6511',
    name: 'Travail à l\'écran',
    filename: 'cfst6511.pdf',
    source: 'CFST_6511',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=6511',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-6512',
    type: 'directive',
    reference: 'CFST 6512',
    name: 'Équipements de travail (Vérification)',
    filename: 'cfst6512.pdf',
    source: 'CFST_6512',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=6512',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-1871',
    type: 'directive',
    reference: 'CFST 6518',
    name: 'Formation et instruction des conducteurs de chariots de manutention',
    filename: 'cfst1871.pdf',
    source: 'CFST_6518',
    versionDate: '2017-07-05',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=6518',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  // CFST 1907 (Utilisation des grues) — PDF non disponible, à ajouter ultérieurement
  {
    id: 'cfst-2134',
    type: 'directive',
    reference: 'CFST 2134',
    name: 'Travaux sur les toits',
    filename: 'cfst2134.pdf',
    source: 'CFST_2134',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: 'https://www.ekas.admin.ch/download.php?id=2134',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  // CFST 2135 (Travaux de fouilles) et CFST 2314 (Explosions) — PDFs non disponibles, à ajouter ultérieurement

  // ===== ESTI =====
  {
    id: 'esti-407',
    type: 'directive',
    reference: 'ESTI 407',
    name: 'Travaux sur ou à proximité d\'installations électriques',
    filename: 'esti407.pdf',
    source: 'ESTI_407',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.esti.admin.ch/fr/documentation/directives',
    downloadUrl: 'https://www.esti.admin.ch/dam/esti/fr/dokumente/richtlinien/esti-407.pdf',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },

  // ===== BONUS : Documents CFST supplémentaires fournis =====
  {
    id: 'cfst-6516',
    type: 'directive',
    reference: 'CFST 6516',
    name: 'Équipements sous pression (directive)',
    filename: 'cfst6516.pdf',
    source: 'CFST_6516',
    versionDate: '2017-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: '',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-6066',
    type: 'directive',
    reference: 'CFST 6066',
    name: 'Situations dangereuses : Faux — Juste (brochure SST)',
    filename: 'cfst6066.pdf',
    source: 'CFST_6066',
    versionDate: '2021-01-01',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: '',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },
  {
    id: 'cfst-6091',
    type: 'directive',
    reference: 'CFST 6091',
    name: 'Sécurité au travail et protection de la santé au bureau',
    filename: 'cfst6091.pdf',
    source: 'CFST_6091',
    versionDate: '2017-06-26',
    sourceUrl: 'https://www.ekas.admin.ch/index-fr.php?frameset=30',
    downloadUrl: '',
    splitPattern: /(?=\d+\.\d+\s+[A-ZÀ-Ü]|Chapitre\s+\d+|Art\.\s*\d+)/gi,
  },

  // ===== CODES (articles isolés) =====
  {
    id: 'co-328',
    type: 'code',
    reference: 'Code des Obligations',
    name: 'Art. 328 CO — Devoir de protection de l\'employeur',
    filename: '',
    source: 'CO',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/fr',
    downloadUrl: '',
    inlineContent: `Art. 328 CO — Protection de la personnalité du travailleur

1 L'employeur protège et respecte, dans les rapports de travail, la personnalité du travailleur; il manifeste les égards voulus pour sa santé et veille au maintien de la moralité. En particulier, il veille à ce que les travailleurs ne soient pas harcelés sexuellement et qu'ils ne soient pas, le cas échéant, désavantagés en raison de tels actes.

2 Il prend, pour protéger la vie, la santé et l'intégrité personnelle du travailleur, les mesures commandées par l'expérience, applicables en l'état de la technique, et adaptées aux conditions de l'exploitation ou du ménage, dans la mesure où les rapports de travail et la nature du travail permettent équitablement de l'exiger de lui.

Art. 328a CO — Logement et nourriture

1 Lorsque le travailleur vit dans le ménage de l'employeur, celui-ci fournit une nourriture suffisante et un logement convenable.

Art. 328b CO — Protection des données personnelles

1 L'employeur ne peut traiter des données concernant le travailleur que dans la mesure où ces données portent sur les aptitudes du travailleur à remplir son emploi ou sont nécessaires à l'exécution du contrat de travail.`,
  },
  {
    id: 'cp-229',
    type: 'code',
    reference: 'Code Pénal',
    name: 'Art. 229 CP — Violation des règles de l\'art de construire',
    filename: '',
    source: 'CP',
    versionDate: '2024-01-01',
    sourceUrl: 'https://www.fedlex.admin.ch/eli/cc/54/757_781_799/fr',
    downloadUrl: '',
    inlineContent: `Art. 229 CP — Violation des règles de l'art de construire

1 Quiconque, intentionnellement, enfreint les règles de l'art en dirigeant ou en exécutant une construction ou une démolition et par là met sciemment en danger la vie ou l'intégrité corporelle des personnes est puni d'une peine privative de liberté de cinq ans au plus ou d'une peine pécuniaire.

2 Si l'auteur enfreint les règles de l'art par négligence, la peine est une peine privative de liberté de trois ans au plus ou une peine pécuniaire.

Art. 230 CP — Violation intentionnelle des règles de l'art de construire (en relation)

Les peines prévues aux art. 229 et 230 s'appliquent également lorsque les constructions ou les démolitions concernent des ouvrages publics ou des installations destinées à un usage public.`,
  },
]

/** Tous les documents (existants + nouveaux) */
export const ALL_NEW_SOURCES = NEW_DOCUMENTS.map((d) => d.source)
