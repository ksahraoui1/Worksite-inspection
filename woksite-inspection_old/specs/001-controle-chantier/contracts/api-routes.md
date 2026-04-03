# API Routes Contract: Controle Chantier

**Type**: Next.js App Router API Routes + Supabase Direct Client
**Date**: 2026-02-27
**Base path**: `/api` (server-side) + Supabase JS client (client-side)

## Architecture

L'application utilise deux modes d'acces aux donnees :
1. **Supabase JS Client** (direct) : Pour les operations CRUD standards cote client via RLS
2. **Next.js API Routes** (server-side) : Pour les operations necessitant une logique metier (notifications, validation state machine, generation PDF)

## API Routes (Next.js Server)

### POST /api/ecarts/stop-danger

Declenchement d'un arret d'urgence STOP Danger. Cree un ecart avec statut `stop_danger` et envoie une notification email au responsable securite.

**Request body**:
```json
{
  "chantier_id": "uuid",
  "checklist_item_id": "uuid | null",
  "constat": "string",
  "photo_url": "string | null"
}
```

**Response 201**:
```json
{
  "ecart": { "id": "uuid", "statut": "stop_danger", ... },
  "notification_sent": true
}
```

**Errors**: 400 (chantier sans responsable email), 404 (chantier introuvable)

### PATCH /api/ecarts/:id/transition

Transition de statut d'un ecart avec validation de la state machine.

**Request body**:
```json
{
  "nouveau_statut": "a_corriger | stop_danger | resolu"
}
```

**Response 200**:
```json
{
  "ecart": { "id": "uuid", "statut": "string", ... },
  "notification_sent": false
}
```

**Errors**: 400 (transition invalide), 404 (ecart introuvable)

**Transitions valides** (validation serveur) :
- `a_corriger` → `stop_danger`, `resolu`
- `stop_danger` → `a_corriger`, `resolu`
- `resolu` → (aucune, erreur 400)

### POST /api/visites/:id/pdf

Generation d'un rapport PDF pour une visite terminee.

**Response 200**: `application/pdf` stream
**Errors**: 400 (visite non terminee), 404 (visite introuvable)

### POST /api/notifications/stop-danger

Envoi de notification email via Resend pour un STOP Danger.

**Request body**:
```json
{
  "ecart_id": "uuid",
  "chantier_id": "uuid"
}
```

**Response 200**: `{ "sent": true }`

## Supabase Client Direct (RLS-protected)

### Chantiers
- `supabase.from('chantier').select('*').is('deleted_at', null).eq('statut', 'actif')`
- `supabase.from('chantier').insert({...})`
- `supabase.from('chantier').update({...}).eq('id', id)`

### Entreprises
- `supabase.from('entreprise').select('*').is('deleted_at', null)`
- CRUD standard via Supabase client

### ChantierEntreprise
- `supabase.from('chantier_entreprise').select('*, entreprise(*)')`
- Insert/delete pour gestion des associations

### Visites
- `supabase.from('visite').select('*, phase(*), ecart(*), reponse_visite(*, checklist_item(*))').eq('chantier_id', id).is('deleted_at', null).order('date_visite', { ascending: false })`
- `supabase.from('visite').insert({...})`
- `supabase.from('visite').update({ statut: 'terminee' }).eq('id', id)`

### ChecklistItems (lecture seule)
- `supabase.from('checklist_item').select('*').eq('phase_id', phaseId).order('ordre')`

### ReponseVisite
- `supabase.from('reponse_visite').upsert({...}).on('visite_id, checklist_item_id')`

### Ecarts (lecture)
- `supabase.from('ecart').select('*, checklist_item(*), entreprise(*)').eq('visite_id', id).is('deleted_at', null)`

### Dashboard Aggregation
```sql
-- Vue: ecarts en retard par chantier
SELECT c.id, c.nom, COUNT(e.id) as ecarts_en_retard
FROM chantier c
JOIN visite v ON v.chantier_id = c.id
JOIN ecart e ON e.visite_id = v.id
WHERE c.statut = 'actif'
  AND c.deleted_at IS NULL
  AND e.statut != 'resolu'
  AND e.deleted_at IS NULL
  AND e.delai_resolution < CURRENT_DATE
GROUP BY c.id, c.nom;
```

## Photo Upload

- Upload via `supabase.storage.from('ecart-photos').upload(path, file)`
- Path format: `{chantier_id}/{visite_id}/{ecart_id}.jpg`
- Public URL via `supabase.storage.from('ecart-photos').getPublicUrl(path)`
