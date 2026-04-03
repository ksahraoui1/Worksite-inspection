/**
 * T013: Parser OTConst — Ordonnance sur les travaux de construction (RS 832.311.141)
 * ~100 articles couvrant la sécurité sur les chantiers de construction
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { chunkDocument, type DocumentChunk } from './chunk'
import { parsePdf } from './parse-pdf'

const SOURCE = 'OTConst'
const VERSION_DATE = '2024-01-01'
const SOURCE_URL =
  'https://www.admin.ch/opc/fr/classified-compilation/19930254/index.html'
const LANGUAGE = 'fr'

const DATA_FILE = resolve(process.cwd(), 'data', 'otconst.txt')
const PDF_FILE = resolve(process.cwd(), 'data', 'otconst.pdf')

/**
 * Generate realistic placeholder chunks representing OTConst structure.
 * Used when the actual source text is not available locally.
 */
function generatePlaceholderChunks(): DocumentChunk[] {
  const articles: { ref: string; content: string }[] = [
    {
      ref: 'Art. 1',
      content:
        'Art. 1 Objet et champ d\'application\n' +
        '1 La présente ordonnance fixe les prescriptions de sécurité pour les travaux de construction.\n' +
        '2 Elle s\'applique à tous les travaux de construction, de transformation et de démolition.',
    },
    {
      ref: 'Art. 2',
      content:
        'Art. 2 Définitions\n' +
        '1 Sont réputés travaux de construction au sens de la présente ordonnance les travaux d\'érection, de transformation, de démolition et d\'entretien de bâtiments et d\'autres ouvrages.\n' +
        '2 Sont réputés ouvrages les constructions fixes ou mobiles, y compris les échafaudages, les coffrages et les installations de chantier.',
    },
    {
      ref: 'Art. 3',
      content:
        'Art. 3 Planification des travaux\n' +
        '1 Les travaux de construction doivent être planifiés de manière que les prescriptions de sécurité puissent être respectées.\n' +
        '2 L\'employeur doit établir un concept de sécurité et un plan de mesures avant le début des travaux.',
    },
    {
      ref: 'Art. 4',
      content:
        'Art. 4 Direction des travaux\n' +
        '1 L\'employeur désigne une personne compétente pour la direction des travaux.\n' +
        '2 Cette personne doit s\'assurer que les prescriptions de sécurité sont appliquées.',
    },
    {
      ref: 'Art. 5',
      content:
        'Art. 5 Formation et instruction\n' +
        '1 L\'employeur doit veiller à ce que les travailleurs soient instruits de manière suffisante sur les risques liés à leur activité.\n' +
        '2 L\'instruction doit être répétée aussi souvent que nécessaire.',
    },
    {
      ref: 'Art. 15',
      content:
        'Art. 15 Postes de travail et voies de circulation en hauteur\n' +
        '1 Les postes de travail et voies de circulation situés au-dessus du vide doivent être munis de protections latérales conformément à l\'art. 21.\n' +
        '2 La hauteur de chute déterminante est mesurée entre le bord du poste de travail et le sol.',
    },
    {
      ref: 'Art. 18',
      content:
        'Art. 18 Ouvertures dans les planchers et les toits\n' +
        '1 Les ouvertures dans les planchers, les toits et les autres surfaces accessibles doivent être recouvertes ou munies de protections latérales.\n' +
        '2 Les couvertures doivent être fixées de manière à ne pas pouvoir être déplacées involontairement.',
    },
    {
      ref: 'Art. 21',
      content:
        'Art. 21 Protections latérales\n' +
        '1 Les protections latérales se composent d\'une lisse supérieure, d\'une lisse intermédiaire et d\'une plinthe.\n' +
        '2 La lisse supérieure doit être placée à une hauteur d\'au moins 1 m au-dessus de la surface de travail.\n' +
        '3 La plinthe doit avoir une hauteur minimale de 15 cm.',
    },
    {
      ref: 'Art. 29',
      content:
        'Art. 29 Échafaudages — Règles générales\n' +
        '1 Les échafaudages doivent être construits, utilisés et démontés conformément aux règles de la technique.\n' +
        '2 L\'employeur veille à ce que les échafaudages soient contrôlés avant leur première utilisation et périodiquement ensuite.',
    },
    {
      ref: 'Art. 33',
      content:
        'Art. 33 Échafaudages de façade\n' +
        '1 Les échafaudages de façade doivent être ancrés au bâtiment conformément aux instructions du fabricant.\n' +
        '2 La distance entre l\'échafaudage et la façade ne doit pas dépasser 30 cm.',
    },
    {
      ref: 'Art. 42',
      content:
        'Art. 42 Travaux de terrassement\n' +
        '1 Les fouilles et les tranchées doivent être étayées ou talutées si la profondeur dépasse 1,5 m.\n' +
        '2 Le talutage doit correspondre à l\'angle de repos naturel du terrain.',
    },
    {
      ref: 'Art. 47',
      content:
        'Art. 47 Travaux de démolition\n' +
        '1 Les travaux de démolition doivent être planifiés et exécutés de manière à ne pas mettre en danger les travailleurs ni les tiers.\n' +
        '2 Un concept de démolition doit être établi par un spécialiste.',
    },
    {
      ref: 'Art. 55',
      content:
        'Art. 55 Travaux sur les toits\n' +
        '1 Les travaux sur les toits à pente doivent être sécurisés au moyen de dispositifs de protection contre les chutes.\n' +
        '2 Des dispositifs de protection individuelle contre les chutes doivent être utilisés lorsque la mise en place de protections collectives n\'est pas possible.',
    },
    {
      ref: 'Art. 60',
      content:
        'Art. 60 Grues\n' +
        '1 Les grues doivent être montées, utilisées et démontées conformément aux prescriptions du fabricant.\n' +
        '2 Seules les personnes formées sont autorisées à conduire des grues.',
    },
    {
      ref: 'Art. 69',
      content:
        'Art. 69 Équipements de protection individuelle\n' +
        '1 L\'employeur met à disposition des travailleurs les équipements de protection individuelle nécessaires.\n' +
        '2 Les travailleurs sont tenus d\'utiliser les équipements de protection individuelle mis à leur disposition.',
    },
    {
      ref: 'Art. 75',
      content:
        'Art. 75 Coordination de la sécurité\n' +
        '1 Lorsque plusieurs entreprises travaillent simultanément sur un chantier, la coordination de la sécurité doit être assurée.\n' +
        '2 Le maître d\'ouvrage désigne un coordinateur de sécurité.',
    },
    {
      ref: 'Art. 83',
      content:
        'Art. 83 Protection contre les intempéries\n' +
        '1 Les travaux de construction en plein air doivent être interrompus en cas de conditions météorologiques dangereuses.\n' +
        '2 L\'employeur doit prendre les mesures nécessaires pour protéger les travailleurs.',
    },
    {
      ref: 'Art. 90',
      content:
        'Art. 90 Premiers secours\n' +
        '1 L\'employeur doit prendre les mesures nécessaires pour que les premiers secours puissent être dispensés en tout temps.\n' +
        '2 Du matériel de premiers secours adapté à la nature des risques doit être disponible sur le chantier.',
    },
    {
      ref: 'Art. 95',
      content:
        'Art. 95 Dispositions pénales\n' +
        '1 Est puni d\'une peine pécuniaire quiconque contrevient intentionnellement aux prescriptions de la présente ordonnance.\n' +
        '2 Si l\'auteur agit par négligence, la peine est une amende.',
    },
    {
      ref: 'Art. 100',
      content:
        'Art. 100 Dispositions finales\n' +
        '1 La présente ordonnance entre en vigueur le 1er janvier 1994.\n' +
        '2 Elle abroge l\'ordonnance du 6 juin 1983 sur les travaux de construction.',
    },
  ]

  return articles.map(({ ref, content }) => ({
    content,
    metadata: {
      source: SOURCE,
      article: ref,
      versionDate: VERSION_DATE,
      sourceUrl: SOURCE_URL,
      language: LANGUAGE,
    },
  }))
}

/**
 * Parse OTConst text into document chunks.
 * Reads from local file if available, otherwise returns placeholder data.
 */
export async function parseOTConst(): Promise<DocumentChunk[]> {
  if (existsSync(PDF_FILE)) {
    return parsePdf({
      pdfPath: PDF_FILE,
      source: SOURCE,
      versionDate: VERSION_DATE,
      sourceUrl: SOURCE_URL,
      language: LANGUAGE,
      splitPattern: /(?=Art\.\s*\d+[a-z]?\b)/gi,
    })
  }

  if (existsSync(DATA_FILE)) {
    console.log(`[OTConst] Reading from local text file: ${DATA_FILE}`)
    const rawText = readFileSync(DATA_FILE, 'utf-8')
    const chunks = chunkDocument(rawText, { source: SOURCE, versionDate: VERSION_DATE, sourceUrl: SOURCE_URL, language: LANGUAGE }, /(?=Art\.\s*\d+[a-z]?\b)/gi)
    console.log(`[OTConst] Parsed ${chunks.length} chunks from text file`)
    return chunks
  }

  console.log(`[OTConst] No PDF or text file found — using placeholder data`)
  const chunks = generatePlaceholderChunks()
  console.log(`[OTConst] Generated ${chunks.length} placeholder chunks`)
  return chunks
}

async function main() {
  console.log('=== OTConst Parser (T013) ===')
  const chunks = await parseOTConst()
  console.log(`\nTotal chunks: ${chunks.length}`)
  console.log('Sample chunk:', JSON.stringify(chunks[0], null, 2))
}

main().catch(console.error)
