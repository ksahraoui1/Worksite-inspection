# API Contract: POST /api/quickref/query

**Feature**: 001-sst-quickref-assistant  
**Date**: 2026-04-02

## Endpoint

**Method**: POST  
**Path**: `/api/quickref/query`  
**Auth**: Bearer JWT Supabase (optionnel pour freemium, requis pour accès illimité)  
**Content-Type**: application/json  
**Rate Limit**: 10 req/jour (anonymous), illimité (authenticated Pro/Premium/Enterprise)

## Request

```json
{
  "question": "Quelle est la hauteur minimale d'un garde-corps selon l'OTConst ?",
  "context": {
    "theme": "Protections_chutes",
    "category": "Article_47_OTConst"
  },
  "language": "fr"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | Yes | Question en français sur la réglementation SST |
| context | object | No | Contexte optionnel pour requêtes depuis Securionis Inspect |
| context.theme | string | No | Thème SST actif (ex: "Protections_chutes") |
| context.category | string | No | Catégorie/article de référence (ex: "Article_47_OTConst") |
| language | string | No | Langue de la réponse. Default: "fr". Valeurs: "fr" (Phase 1-2 uniquement) |

## Response — Success (200)

```json
{
  "query_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "answer": "Selon l'article 47 de l'OTConst, la hauteur minimale d'un garde-corps est de 1 mètre. Pour les chutes de plus de 3 mètres, des mesures de protection renforcées sont requises.",
  "sources": [
    {
      "source": "OTConst",
      "article": "Art. 47",
      "version_date": "2024-01-01",
      "source_url": "https://www.admin.ch/opc/fr/classified-compilation/19930254/index.html",
      "excerpt": "Les garde-corps doivent avoir une hauteur d'au moins 1 m..."
    }
  ],
  "similarity_score": 0.89,
  "disclaimer": "SST-QuickRef est un outil d'aide à la référence réglementaire. Les informations fournies sont basées sur les textes officiels indexés à la date indiquée. Elles ne constituent pas un avis juridique. En cas de doute ou de litige, consultez un juriste spécialisé en droit du travail suisse ou les autorités compétentes (SUVA, SECO, Inspection du travail). Securionis SA décline toute responsabilité en cas d'utilisation non conforme.",
  "response_ms": 1850
}
```

| Field | Type | Description |
|-------|------|-------------|
| query_id | string (UUID) | Identifiant unique de la requête (pour feedback) |
| answer | string | Réponse générée avec citations intégrées |
| sources | array | Liste des sources réglementaires citées |
| sources[].source | string | Nom de la source (OTConst, CFST_6508, OPA) |
| sources[].article | string | Référence de l'article |
| sources[].version_date | string (ISO date) | Date de la version du texte |
| sources[].source_url | string | URL officielle du document |
| sources[].excerpt | string | Extrait pertinent du texte source |
| similarity_score | number | Score de similarité cosinus du meilleur chunk (0-1) |
| disclaimer | string | Disclaimer légal obligatoire |
| response_ms | integer | Temps de traitement en millisecondes |

## Response — No Match (200)

Quand le score de pertinence est inférieur au seuil (0.75) :

```json
{
  "query_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "answer": null,
  "sources": [],
  "similarity_score": 0.62,
  "refused": true,
  "refused_reason": "Aucun texte réglementaire trouvé correspondant à votre question. Essayez de reformuler ou de préciser le texte de loi concerné.",
  "disclaimer": "...",
  "response_ms": 450
}
```

## Response — Rate Limited (429)

```json
{
  "error": "rate_limit_exceeded",
  "message": "Vous avez atteint la limite de 10 requêtes gratuites par jour. Créez un compte ou souscrivez au plan Pro (CHF 29/mois) pour un accès illimité.",
  "retry_after": 86400
}
```

## Response — Error (500)

```json
{
  "error": "internal_error",
  "message": "Le service est temporairement indisponible. Veuillez réessayer dans quelques instants."
}
```

## Response — Unsupported Language (400)

```json
{
  "error": "unsupported_language",
  "message": "SST-QuickRef supporte uniquement le français pour le moment. Le support de l'allemand est prévu prochainement."
}
```

## Headers

**Request**:
- `Authorization: Bearer {jwt_token}` (optionnel)
- `Content-Type: application/json`

**Response**:
- `Content-Type: application/json`
- `X-RateLimit-Remaining: {count}` (pour anonymous uniquement)
- `X-RateLimit-Reset: {unix_timestamp}` (pour anonymous uniquement)
