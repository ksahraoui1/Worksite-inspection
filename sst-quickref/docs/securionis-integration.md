# Securionis Inspect — SST-QuickRef Integration Guide

## Overview

SST-QuickRef provides a regulatory AI assistant that Securionis Inspect can call during inspections to get contextual answers from Swiss SST regulations. The integration is a simple REST API call.

## Endpoint

```
POST https://<project-ref>.supabase.co/functions/v1/quickref-query
```

## Authentication

Pass the user's Supabase JWT token in the Authorization header. Anonymous requests are accepted but rate-limited (10/day per IP).

```
Authorization: Bearer <supabase-jwt-token>
```

## Request Format

```json
{
  "question": "Quelle est la hauteur minimale des garde-corps sur un chantier?",
  "context": {
    "theme": "Protection contre les chutes",
    "category": "Garde-corps"
  },
  "language": "fr"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | The user's question, max 500 characters |
| `context.theme` | string | No | Current inspection theme (improves relevance) |
| `context.category` | string | No | Current inspection category (improves relevance) |
| `language` | string | No | Language code. Only `"fr"` supported currently |

### Passing context from Securionis Inspect

When the user is inspecting a specific theme/category, include it in the `context` object. This enriches the vector search query and improves result relevance:

```typescript
// Example: user is on the "Protection contre les chutes" theme
const response = await fetch(QUICKREF_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    question: userQuestion,
    context: {
      theme: currentVisite.theme_name,
      category: currentVisite.category_name,
    },
  }),
});
```

## Response Format

### Successful response (200)

```json
{
  "query_id": "550e8400-e29b-41d4-a716-446655440000",
  "answer": "Selon l'OTConst art. 22, les garde-corps doivent avoir une hauteur minimale de 1 mètre...",
  "sources": [
    {
      "source": "OTConst",
      "article": "Art. 22",
      "version_date": "2024-01-01",
      "source_url": "https://www.fedlex.admin.ch/...",
      "excerpt": "Les garde-corps de chantier doivent avoir une hauteur d'au moins..."
    }
  ],
  "similarity_score": 0.87,
  "disclaimer": "Information à titre indicatif uniquement...",
  "response_ms": 1250
}
```

### Refused response (200, no matching regulation found)

```json
{
  "query_id": "550e8400-e29b-41d4-a716-446655440000",
  "answer": null,
  "sources": [],
  "similarity_score": 0.42,
  "refused": true,
  "refused_reason": "Aucun texte réglementaire trouvé correspondant à votre question...",
  "disclaimer": "Information à titre indicatif uniquement...",
  "response_ms": 350
}
```

### Error responses

**400 Bad Request** — Invalid input:
```json
{
  "error": "bad_request",
  "message": "Question is required"
}
```

**405 Method Not Allowed**:
```json
{
  "error": "method_not_allowed",
  "message": "Only POST is accepted"
}
```

**429 Too Many Requests** (anonymous users, 10/day limit):
```json
{
  "error": "rate_limited",
  "message": "Limite de requêtes atteinte. Veuillez vous authentifier ou réessayer demain.",
  "remaining": 0,
  "reset_at": 1712150400000
}
```

**500 Internal Server Error**:
```json
{
  "error": "internal_error",
  "message": "Le service est temporairement indisponible."
}
```

## Feedback Endpoint

After displaying a response, allow users to rate it:

```
POST https://<project-ref>.supabase.co/functions/v1/quickref-feedback
```

```json
{
  "query_id": "550e8400-e29b-41d4-a716-446655440000",
  "rating": "up"
}
```

Returns `201` on success, `409` if feedback already submitted for that query.

## Fallback Handling

When the QuickRef service is unavailable, Securionis Inspect should degrade gracefully:

```typescript
const QUICKREF_URL = process.env.NEXT_PUBLIC_QUICKREF_URL;
const QUICKREF_TIMEOUT_MS = 8000;
const QUICKREF_FALLBACK_URL = 'https://www.suva.ch/fr-ch/prevention/themes-specialises/securite-sur-les-chantiers';

async function queryQuickRef(
  question: string,
  context?: { theme?: string; category?: string }
) {
  // If QuickRef URL is not configured, show fallback link
  if (!QUICKREF_URL) {
    return {
      available: false,
      fallback_url: QUICKREF_FALLBACK_URL,
      message: 'Assistant réglementaire non configuré.',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), QUICKREF_TIMEOUT_MS);

    const response = await fetch(QUICKREF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`QuickRef returned ${response.status}`);
    }

    const data = await response.json();
    return { available: true, data };
  } catch (error) {
    console.warn('QuickRef unavailable:', error);
    return {
      available: false,
      fallback_url: QUICKREF_FALLBACK_URL,
      message: 'L\'assistant réglementaire est temporairement indisponible. Consultez les ressources SUVA.',
    };
  }
}
```

### Fallback UI pattern

When `available` is `false`, display the fallback link instead of the AI answer:

```tsx
{!quickRefResult.available && (
  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
    <p className="text-sm text-amber-800">{quickRefResult.message}</p>
    <a
      href={quickRefResult.fallback_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-amber-700 underline mt-2 inline-block"
    >
      Consulter les ressources SUVA
    </a>
  </div>
)}
```

## Rate Limits

| User type | Limit | Window |
|-----------|-------|--------|
| Anonymous (no JWT) | 10 requests | 24 hours (rolling) |
| Authenticated (inspector/admin) | Unlimited | - |

Authenticated requests require a valid Supabase JWT in the `Authorization: Bearer` header.
