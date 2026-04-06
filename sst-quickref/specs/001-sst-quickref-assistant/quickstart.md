# Quickstart: SST-QuickRef

**Feature**: 001-sst-quickref-assistant  
**Date**: 2026-04-02

## Prérequis

- Node.js 20+ et npm
- Supabase CLI (`npx supabase`)
- Compte Anthropic API (Claude Sonnet)
- Compte OpenAI API (text-embedding-3-small)
- Projet Supabase avec extension pgvector activée

## Variables d'environnement

```bash
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
QUICKREF_SIMILARITY_THRESHOLD=0.75
QUICKREF_TOP_K=5
QUICKREF_MAX_CHUNK_TOKENS=512
```

## Setup initial

### 1. Activer pgvector dans Supabase

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Appliquer les migrations

```bash
cd supabase
npx supabase db push
```

### 3. Ingérer les textes réglementaires Priorité 1

```bash
# Parser et ingérer OTConst
npx tsx scripts/ingest/parse-otconst.ts

# Parser et ingérer CFST 6508
npx tsx scripts/ingest/parse-cfst6508.ts

# Parser et ingérer OPA Art. 62
npx tsx scripts/ingest/parse-opa.ts
```

### 4. Valider l'ingestion

```bash
# Vérifier le nombre de chunks insérés
npx supabase db execute "SELECT source, COUNT(*) FROM documents_sst WHERE NOT is_superseded GROUP BY source;"
```

Résultat attendu : ~300 OTConst, ~100 CFST_6508, ~50 OPA.

### 5. Démarrer le frontend

```bash
cd frontend
npm install
npm run dev
```

Accessible sur `http://localhost:5173`.

### 6. Démarrer les Edge Functions localement

```bash
cd supabase
npx supabase functions serve
```

### 7. Tester le POC RAG

```bash
# Test en ligne de commande
curl -X POST http://localhost:54321/functions/v1/quickref-query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"question": "Quelle hauteur minimale pour un garde-corps ?", "language": "fr"}'
```

### 8. Exécuter le benchmark (50 questions)

```bash
npx tsx scripts/validate/run-benchmark.ts
```

Sortie attendue : taux de citations correctes, temps de réponse moyen, taux de refus sur questions hors périmètre.

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement frontend (Vite) |
| `npm run build` | Build production du frontend |
| `npx supabase functions serve` | Edge Functions en local |
| `npx supabase db push` | Appliquer les migrations |
| `npx tsx scripts/ingest/parse-otconst.ts` | Ingérer OTConst |
| `npx tsx scripts/validate/run-benchmark.ts` | Benchmark 50 questions |
