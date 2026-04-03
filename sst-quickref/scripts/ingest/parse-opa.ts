/**
 * T015: Parser OPA — Ordonnance sur la prévention des accidents (RS 832.30)
 * Focus sur l'Art. 62 et les dispositions connexes
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { chunkDocument, type DocumentChunk } from './chunk'
import { parsePdf } from './parse-pdf'

const SOURCE = 'OPA'
const VERSION_DATE = '2024-01-01'
const SOURCE_URL =
  'https://www.admin.ch/opc/fr/classified-compilation/19830284/index.html'
const LANGUAGE = 'fr'

const DATA_FILE = resolve(process.cwd(), 'data', 'opa.txt')
const PDF_FILE = resolve(process.cwd(), 'data', 'opa.pdf')

/**
 * Generate realistic placeholder chunks for OPA Art. 62 and related provisions.
 * Art. 62 concerns construction site safety coordination.
 */
function generatePlaceholderChunks(): DocumentChunk[] {
  const articles: { ref: string; content: string }[] = [
    {
      ref: 'Art. 3',
      content:
        'Art. 3 Mesures de prévention des accidents et maladies professionnelles\n' +
        '1 L\'employeur est tenu de prendre toutes les mesures dont l\'expérience a démontré la nécessité, ' +
        'que l\'état de la technique permet d\'appliquer et qui sont adaptées aux conditions données, pour protéger ' +
        'les travailleurs contre les accidents et les maladies professionnelles.\n' +
        '2 Il doit en outre prendre toutes les mesures nécessaires pour protéger l\'intégrité personnelle des travailleurs.',
    },
    {
      ref: 'Art. 6',
      content:
        'Art. 6 Information et instruction des travailleurs\n' +
        '1 L\'employeur veille à ce que tous les travailleurs occupés dans son entreprise, y compris ceux provenant ' +
        'd\'une autre entreprise, soient informés de manière suffisante et appropriée des risques auxquels ils sont exposés.\n' +
        '2 Il veille à ce qu\'ils soient instruits des mesures de sécurité au travail et de protection de la santé.',
    },
    {
      ref: 'Art. 7',
      content:
        'Art. 7 Equipements de protection individuelle\n' +
        '1 L\'employeur met à la disposition des travailleurs les équipements de protection individuelle nécessaires.\n' +
        '2 Il veille à ce que ces équipements soient toujours en parfait état et prêts à être utilisés.',
    },
    {
      ref: 'Art. 8',
      content:
        'Art. 8 Travaux comportant des dangers particuliers\n' +
        '1 L\'employeur ne peut confier des travaux comportant des dangers particuliers qu\'à des travailleurs ayant été ' +
        'formés à cet effet. La formation doit être documentée.\n' +
        '2 Lorsque des travaux comportant des dangers particuliers sont exécutés, une surveillance appropriée doit être assurée.',
    },
    {
      ref: 'Art. 11a',
      content:
        'Art. 11a Obligation de recourir à des spécialistes\n' +
        '1 L\'employeur doit recourir à des médecins du travail et autres spécialistes de la sécurité au travail (MSST) ' +
        'lorsque la protection de la santé des travailleurs et leur sécurité l\'exigent.\n' +
        '2 L\'obligation de recourir à des spécialistes dépend notamment du risque d\'accidents et de maladies ' +
        'professionnelles ainsi que de la structure et de l\'effectif de l\'entreprise.',
    },
    {
      ref: 'Art. 32a',
      content:
        'Art. 32a Voies de circulation\n' +
        '1 Les voies de circulation pour les véhicules et les piétons doivent être conçues de manière à garantir ' +
        'la sécurité de la circulation.\n' +
        '2 Les voies de circulation doivent être maintenues libres de tout obstacle.',
    },
    {
      ref: 'Art. 57',
      content:
        'Art. 57 Ascenseurs et monte-charges\n' +
        '1 Les ascenseurs et monte-charges doivent être installés, entretenus et contrôlés conformément aux ' +
        'prescriptions techniques reconnues.\n' +
        '2 Ils doivent être munis de dispositifs de sécurité empêchant les chutes et les écrasements.',
    },
    {
      ref: 'Art. 60',
      content:
        'Art. 60 Travaux de construction — Principes\n' +
        '1 Les règles de sécurité applicables aux travaux de construction sont fixées dans l\'ordonnance ' +
        'sur les travaux de construction (OTConst).\n' +
        '2 Les dispositions générales de la présente ordonnance s\'appliquent en complément.',
    },
    {
      ref: 'Art. 61',
      content:
        'Art. 61 Coordination sur les chantiers\n' +
        '1 Lorsque des travailleurs de plusieurs entreprises sont occupés simultanément sur un lieu de travail, ' +
        'les employeurs doivent convenir des mesures à prendre pour assurer la sécurité au travail.\n' +
        '2 Ils doivent s\'informer mutuellement des dangers particuliers liés à leurs activités respectives.',
    },
    {
      ref: 'Art. 62',
      content:
        'Art. 62 Obligations particulières du maître d\'ouvrage\n' +
        '1 Le maître d\'ouvrage qui occupe sur un chantier des travailleurs de plusieurs entreprises doit désigner ' +
        'un coordinateur de sécurité lorsque les circonstances l\'exigent.\n' +
        '2 Le coordinateur de sécurité veille à ce que:\n' +
        'a. les mesures de sécurité soient coordonnées entre les entreprises;\n' +
        'b. les informations relatives aux dangers soient communiquées à toutes les entreprises;\n' +
        'c. un plan de sécurité et de protection de la santé soit établi;\n' +
        'd. le respect des mesures de sécurité soit contrôlé.\n' +
        '3 Le maître d\'ouvrage peut déléguer ses obligations au chef de projet ou à l\'entreprise générale. ' +
        'La délégation doit être consignée par écrit.\n' +
        '4 La coordination est d\'autant plus nécessaire que le nombre d\'entreprises occupées simultanément est élevé ' +
        'et que les travaux comportent des risques importants.',
    },
    {
      ref: 'Art. 63',
      content:
        'Art. 63 Plan de sécurité et de protection de la santé\n' +
        '1 Le plan de sécurité et de protection de la santé doit contenir:\n' +
        'a. l\'identification des dangers spécifiques au chantier;\n' +
        'b. les mesures de prévention prévues;\n' +
        'c. l\'organisation des secours;\n' +
        'd. les règles de circulation sur le chantier.\n' +
        '2 Le plan doit être mis à jour régulièrement en fonction de l\'avancement des travaux.',
    },
    {
      ref: 'Art. 64',
      content:
        'Art. 64 Déclaration d\'un chantier\n' +
        '1 Les chantiers de grande envergure ou présentant des dangers particuliers doivent être déclarés ' +
        'à l\'autorité compétente avant le début des travaux.\n' +
        '2 La déclaration contient les indications relatives au lieu, à la nature et à la durée des travaux ' +
        'ainsi qu\'aux entreprises participantes.',
    },
    {
      ref: 'Art. 65',
      content:
        'Art. 65 Substances dangereuses sur les chantiers\n' +
        '1 L\'utilisation de substances dangereuses sur les chantiers est soumise aux prescriptions de la législation ' +
        'sur les produits chimiques.\n' +
        '2 L\'employeur doit s\'assurer que les travailleurs connaissent les risques liés aux substances utilisées ' +
        'et sont instruits des mesures de protection.',
    },
    {
      ref: 'Art. 66',
      content:
        'Art. 66 Amiante\n' +
        '1 Les travaux susceptibles de libérer des fibres d\'amiante ne peuvent être exécutés que par des entreprises ' +
        'reconnues par la Suva.\n' +
        '2 Un diagnostic amiante doit être réalisé avant tout travail de rénovation ou de démolition ' +
        'dans un bâtiment construit avant 1990.',
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
 * Parse OPA text into document chunks.
 * Focus on Art. 62 and related construction safety provisions.
 * Reads from local file if available, otherwise returns placeholder data.
 */
export async function parseOPA(): Promise<DocumentChunk[]> {
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
    console.log(`[OPA] Reading from local text file: ${DATA_FILE}`)
    const rawText = readFileSync(DATA_FILE, 'utf-8')
    const chunks = chunkDocument(rawText, { source: SOURCE, versionDate: VERSION_DATE, sourceUrl: SOURCE_URL, language: LANGUAGE }, /(?=Art\.\s*\d+[a-z]?\b)/gi)
    console.log(`[OPA] Parsed ${chunks.length} chunks from text file`)
    return chunks
  }

  console.log(`[OPA] No PDF or text file found — using placeholder data`)
  const chunks = generatePlaceholderChunks()
  console.log(`[OPA] Generated ${chunks.length} placeholder chunks`)
  return chunks
}

async function main() {
  console.log('=== OPA Parser (T015) ===')
  const chunks = await parseOPA()
  console.log(`\nTotal chunks: ${chunks.length}`)

  // Highlight Art. 62
  const art62 = chunks.find((c) => c.metadata.article === 'Art. 62')
  if (art62) {
    console.log('\nArt. 62 (key article):', JSON.stringify(art62, null, 2))
  }
}

main().catch(console.error)
