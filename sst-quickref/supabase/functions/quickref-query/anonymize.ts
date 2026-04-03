/**
 * T043: Query anonymization
 * Removes personally identifiable information from user questions
 * before logging or processing.
 */

/**
 * Anonymizes a question by removing PII patterns common in Swiss contexts.
 * - Company names (SA, Sàrl, GmbH, AG)
 * - Street addresses (rue, avenue, chemin + number + city)
 * - Personal names (M./Mme/Mr + capitalized words)
 * - Swiss phone numbers (+41, 0xx xxx xx xx)
 * - Email addresses
 */
export function anonymizeQuestion(question: string): string {
  let result = question

  // Remove email addresses
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL]'
  )

  // Remove Swiss phone numbers: +41 xx xxx xx xx, 0xx xxx xx xx, variants with dots/dashes
  result = result.replace(
    /(\+41|0041)\s?[\s.\-]?\(?\d{1,2}\)?\s?[\s.\-]?\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2}/g,
    '[TELEPHONE]'
  )
  result = result.replace(
    /0\d{2}[\s.\-]?\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2}/g,
    '[TELEPHONE]'
  )

  // Remove company names: word(s) followed by SA, Sàrl, SARL, GmbH, AG
  result = result.replace(
    /(?:[A-Z\u00C0-\u00DC][a-zA-Z\u00C0-\u00FF&.\-]+\s+){0,4}(?:SA|Sàrl|SARL|S\.?à\.?r\.?l\.?|GmbH|AG)\b/g,
    '[ENTREPRISE]'
  )

  // Remove personal names: M./Mme/Mr/Mme./Monsieur/Madame followed by capitalized words
  result = result.replace(
    /(?:M\.|Mme\.?|Mr\.?|Monsieur|Madame)\s+[A-Z\u00C0-\u00DC][a-zA-Z\u00C0-\u00FF]+(?:\s+[A-Z\u00C0-\u00DC][a-zA-Z\u00C0-\u00FF]+)?/g,
    '[NOM]'
  )

  // Remove Swiss addresses: rue/avenue/chemin/route/place + text + number + optional city
  result = result.replace(
    /(?:rue|avenue|av\.|chemin|ch\.|route|rte\.|place|pl\.|boulevard|bd\.)\s+[A-Za-z\u00C0-\u00FF\s\-'.]+?\s*\d{1,4}[a-zA-Z]?(?:\s*,?\s*\d{4}\s+[A-Za-z\u00C0-\u00FF\s\-]+)?/gi,
    '[ADRESSE]'
  )

  // Clean up multiple spaces
  result = result.replace(/\s{2,}/g, ' ').trim()

  return result
}
