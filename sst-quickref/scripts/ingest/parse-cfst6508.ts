/**
 * T014: Parser CFST 6508 — Directive relative à l'appel à des médecins du travail
 * et autres spécialistes de la sécurité au travail (Directive MSST)
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { chunkDocument, type DocumentChunk } from './chunk'
import { parsePdf } from './parse-pdf'

const SOURCE = 'CFST_6508'
const VERSION_DATE = '2024-01-01'
const SOURCE_URL =
  'https://www.cfst.admin.ch/cfst/fr/home/directives/6508.html'
const LANGUAGE = 'fr'

const DATA_FILE = resolve(process.cwd(), 'data', 'cfst6508.txt')
const PDF_FILE = resolve(process.cwd(), 'data', 'cfst6508.pdf')

/**
 * Generate realistic placeholder chunks representing CFST 6508 structure.
 * The directive is organized by chapters and sections, not numbered articles.
 */
function generatePlaceholderChunks(): DocumentChunk[] {
  const sections: { ref: string; content: string }[] = [
    {
      ref: 'Chapitre 1',
      content:
        'Chapitre 1 Dispositions générales\n\n' +
        '1.1 But\n' +
        'La présente directive fixe les conditions et modalités relatives à l\'appel à des médecins du travail ' +
        'et autres spécialistes de la sécurité au travail (MSST). Elle concrétise l\'obligation de l\'employeur ' +
        'd\'assurer le recours à des spécialistes conformément à l\'art. 11a OPA.',
    },
    {
      ref: 'Chapitre 1',
      content:
        '1.2 Champ d\'application\n' +
        'La directive s\'applique à toutes les entreprises soumises à la loi fédérale sur l\'assurance-accidents (LAA). ' +
        'Toute entreprise occupant des travailleurs en Suisse est tenue d\'appliquer les dispositions relatives ' +
        'à la sécurité au travail et à la protection de la santé.',
    },
    {
      ref: 'Chapitre 2',
      content:
        'Chapitre 2 Obligations de l\'employeur\n\n' +
        '2.1 Principes\n' +
        'L\'employeur est responsable de la sécurité et de la protection de la santé des travailleurs dans son entreprise. ' +
        'Il doit identifier systématiquement les dangers, évaluer les risques et prendre les mesures de protection nécessaires.\n\n' +
        '2.2 Identification des dangers\n' +
        'L\'employeur doit procéder à une identification systématique des dangers existants dans son entreprise. ' +
        'Cette identification doit couvrir l\'ensemble des postes de travail et des activités.',
    },
    {
      ref: 'Chapitre 3',
      content:
        'Chapitre 3 Détermination de l\'obligation de recourir à des spécialistes\n\n' +
        '3.1 Critères\n' +
        'L\'obligation de faire appel à des MSST dépend des dangers spécifiques présents dans l\'entreprise. ' +
        'Les entreprises présentant des dangers particuliers doivent recourir à des spécialistes de la sécurité au travail.\n\n' +
        '3.2 Classification des entreprises\n' +
        'Les entreprises sont classées selon leur risque. Les entreprises du secteur de la construction ' +
        'sont généralement considérées comme présentant des dangers particuliers.',
    },
    {
      ref: 'Chapitre 4',
      content:
        'Chapitre 4 Solution individuelle\n\n' +
        '4.1 Principes de la solution individuelle\n' +
        'L\'employeur peut mettre en œuvre une solution individuelle adaptée à son entreprise. ' +
        'Il doit définir l\'organisation de la sécurité et établir un système de sécurité comprenant les dix éléments suivants.\n\n' +
        '4.2 Les dix éléments du système de sécurité\n' +
        '1. Principes directeurs, objectifs de sécurité\n' +
        '2. Organisation de la sécurité\n' +
        '3. Formation, instruction, information\n' +
        '4. Règles de sécurité\n' +
        '5. Identification des dangers, évaluation des risques\n' +
        '6. Planification et réalisation des mesures\n' +
        '7. Organisation en cas d\'urgence\n' +
        '8. Participation\n' +
        '9. Protection de la santé\n' +
        '10. Contrôle, audit',
    },
    {
      ref: 'Chapitre 5',
      content:
        'Chapitre 5 Solutions par branche\n\n' +
        '5.1 Principes\n' +
        'Les organisations professionnelles ou de branche peuvent élaborer des solutions par branche. ' +
        'Ces solutions doivent être approuvées par la CFST et offrir un cadre adapté aux dangers spécifiques de la branche.\n\n' +
        '5.2 Contenu des solutions par branche\n' +
        'La solution par branche doit contenir au minimum une liste des dangers spécifiques à la branche, ' +
        'les mesures de prévention correspondantes et les modalités de formation.',
    },
    {
      ref: 'Chapitre 6',
      content:
        'Chapitre 6 Spécialistes de la sécurité au travail\n\n' +
        '6.1 Catégories de spécialistes\n' +
        'Les spécialistes de la sécurité au travail (MSST) comprennent:\n' +
        '- les médecins du travail\n' +
        '- les hygiénistes du travail\n' +
        '- les ingénieurs de sécurité\n' +
        '- les chargés de sécurité\n\n' +
        '6.2 Qualifications requises\n' +
        'Chaque catégorie de spécialiste doit répondre à des exigences de formation spécifiques définies dans les annexes.',
    },
    {
      ref: 'Chapitre 7',
      content:
        'Chapitre 7 Tâches des spécialistes\n\n' +
        '7.1 Tâches générales\n' +
        'Les spécialistes MSST conseillent l\'employeur et les travailleurs en matière de sécurité au travail et de protection de la santé. ' +
        'Ils soutiennent l\'employeur dans l\'identification des dangers et l\'évaluation des risques.\n\n' +
        '7.2 Tâches spécifiques au secteur de la construction\n' +
        'Dans le secteur de la construction, les spécialistes doivent porter une attention particulière aux risques de chute, ' +
        'd\'ensevelissement, d\'électrocution et aux risques liés aux machines de chantier.',
    },
    {
      ref: 'Chapitre 8',
      content:
        'Chapitre 8 Contrôle et surveillance\n\n' +
        '8.1 Organes d\'exécution\n' +
        'La surveillance de l\'application de la directive est assurée par la Suva, les inspections cantonales du travail ' +
        'et le SECO. Ces organes vérifient que les entreprises appliquent correctement les dispositions.\n\n' +
        '8.2 Audits\n' +
        'Les entreprises appliquant une solution par branche font l\'objet d\'audits périodiques ' +
        'par l\'organisme responsable de la solution.',
    },
    {
      ref: 'Chapitre 9',
      content:
        'Chapitre 9 Dispositions finales\n\n' +
        '9.1 Entrée en vigueur\n' +
        'La directive 6508 a été adoptée par la Commission fédérale de coordination pour la sécurité au travail (CFST).\n\n' +
        '9.2 Annexes\n' +
        'Les annexes font partie intégrante de la directive. Elles comprennent la liste des dangers, ' +
        'les critères de qualification des spécialistes et les formulaires types.',
    },
  ]

  return sections.map(({ ref, content }) => ({
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
 * Parse CFST 6508 directive into document chunks.
 * Reads from local file if available, otherwise returns placeholder data.
 */
export async function parseCFST6508(): Promise<DocumentChunk[]> {
  if (existsSync(PDF_FILE)) {
    return parsePdf({
      pdfPath: PDF_FILE,
      source: SOURCE,
      versionDate: VERSION_DATE,
      sourceUrl: SOURCE_URL,
      language: LANGUAGE,
      splitPattern: /(?=Chapitre\s+\d+|Section\s+\d+|\d+\.\d+\s+[A-Z])/g,
    })
  }

  if (existsSync(DATA_FILE)) {
    console.log(`[CFST 6508] Reading from local text file: ${DATA_FILE}`)
    const rawText = readFileSync(DATA_FILE, 'utf-8')
    const chunks = chunkDocument(rawText, { source: SOURCE, versionDate: VERSION_DATE, sourceUrl: SOURCE_URL, language: LANGUAGE }, /(?=Chapitre\s+\d+|Section\s+\d+|\d+\.\d+\s+[A-Z])/g)
    console.log(`[CFST 6508] Parsed ${chunks.length} chunks from text file`)
    return chunks
  }

  console.log(`[CFST 6508] No PDF or text file found — using placeholder data`)
  const chunks = generatePlaceholderChunks()
  console.log(`[CFST 6508] Generated ${chunks.length} placeholder chunks`)
  return chunks
}

async function main() {
  console.log('=== CFST 6508 Parser (T014) ===')
  const chunks = await parseCFST6508()
  console.log(`\nTotal chunks: ${chunks.length}`)
  console.log('Sample chunk:', JSON.stringify(chunks[0], null, 2))
}

main().catch(console.error)
