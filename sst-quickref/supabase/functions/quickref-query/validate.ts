/**
 * T048: Input validation for quickref-query requests
 * Validates and sanitizes incoming request bodies.
 */

export interface QuickRefRequest {
  question: string
  context?: {
    theme?: string
    category?: string
  }
  language?: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
  parsed?: QuickRefRequest
}

const MAX_QUESTION_LENGTH = 500
const ALPHANUMERIC_UNDERSCORE = /^[a-zA-Z0-9_\u00C0-\u00FF\s\-]+$/

/**
 * Validates and sanitizes an incoming request body.
 *
 * - question: required string, max 500 characters
 * - context.theme / context.category: alphanumeric + underscore + accents only
 * - language: must be 'fr' or undefined
 */
export function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Le corps de la requête est invalide.' }
  }

  const obj = body as Record<string, unknown>

  // Validate question
  if (!obj.question || typeof obj.question !== 'string') {
    return { valid: false, error: 'Le champ "question" est requis et doit être une chaîne.' }
  }

  const question = obj.question.trim()

  if (question.length === 0) {
    return { valid: false, error: 'Le champ "question" ne peut pas être vide.' }
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return {
      valid: false,
      error: `La question dépasse la limite de ${MAX_QUESTION_LENGTH} caractères.`,
    }
  }

  // Validate and sanitize context
  let context: QuickRefRequest['context'] = undefined

  if (obj.context !== undefined) {
    if (typeof obj.context !== 'object' || obj.context === null) {
      return { valid: false, error: 'Le champ "context" doit être un objet.' }
    }

    const ctx = obj.context as Record<string, unknown>
    context = {}

    if (ctx.theme !== undefined) {
      if (typeof ctx.theme !== 'string') {
        return { valid: false, error: 'Le champ "context.theme" doit être une chaîne.' }
      }
      const theme = ctx.theme.trim()
      if (theme.length > 0 && !ALPHANUMERIC_UNDERSCORE.test(theme)) {
        return {
          valid: false,
          error: 'Le champ "context.theme" contient des caractères non autorisés.',
        }
      }
      if (theme.length > 0) {
        context.theme = theme
      }
    }

    if (ctx.category !== undefined) {
      if (typeof ctx.category !== 'string') {
        return { valid: false, error: 'Le champ "context.category" doit être une chaîne.' }
      }
      const category = ctx.category.trim()
      if (category.length > 0 && !ALPHANUMERIC_UNDERSCORE.test(category)) {
        return {
          valid: false,
          error: 'Le champ "context.category" contient des caractères non autorisés.',
        }
      }
      if (category.length > 0) {
        context.category = category
      }
    }

    // Only include context if it has at least one field
    if (!context.theme && !context.category) {
      context = undefined
    }
  }

  // Validate language
  let language: string | undefined = undefined

  if (obj.language !== undefined) {
    if (typeof obj.language !== 'string') {
      return { valid: false, error: 'Le champ "language" doit être une chaîne.' }
    }
    if (obj.language !== 'fr') {
      return {
        valid: false,
        error: 'Seule la langue "fr" est supportée actuellement.',
      }
    }
    language = obj.language
  }

  return {
    valid: true,
    parsed: {
      question,
      context,
      language,
    },
  }
}
