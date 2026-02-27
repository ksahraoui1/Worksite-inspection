# Research: Controle Chantier

**Feature**: 001-controle-chantier
**Date**: 2026-02-27

## 1. Synchronisation hors-ligne Supabase + PWA

**Decision**: Pattern "Write-Local, Sync-on-Connection" avec poll-based sync (30s).

**Rationale**: Supabase Realtime necessite une connexion WebSocket active, incompatible avec le mode hors-ligne. Le pattern write-local-first avec Dexie.js comme source de verite locale et Supabase comme source de verite serveur est le plus adapte. La synchronisation par polling (toutes les 30s quand online) est fiable et economique en batterie.

**Alternatives considered**:
- Supabase Realtime seul : ne fonctionne pas hors-ligne
- Firebase Cloud Messaging : pas adapte pour garanties de sync
- Replicache : trop complexe pour du mono-tenant single-device

**Implementation**: Dexie.js ecrit immediatement, syncStatus = "pending". Au retour de connexion, batch upload photos puis donnees. Marquer "synced" uniquement apres confirmation serveur. Strategie last-write-wins avec protection STOP Danger.

## 2. Serwist + Next.js App Router

**Decision**: Serwist 9.x est compatible et production-ready avec Next.js 14 App Router.

**Rationale**: Configuration validee dans le projet existant Controle-bat. La configuration correcte inclut : swSrc dans src/app/sw.ts, disable en dev, navigationPreload, skipWaiting, clientsClaim.

**Alternatives considered**:
- Workbox direct : plus verbeux, Serwist est un wrapper plus propre
- SW manuel : Serwist gere l'auto-registration mieux

**Recommandations** :
- Ajouter du runtime caching granulaire pour les appels Supabase API (NetworkFirst)
- Desactiver en dev pour eviter le cache de donnees stale
- Tester sur iOS Safari et Android Chrome (comportement PWA different)

## 3. Dexie.js schema versioning

**Decision**: Versioning semantique avec migrations gatees par version.

**Rationale**: Dexie supporte nativement les migrations via `this.version(N).stores({...}).upgrade(tx => {...})`. Chaque ajout de champ = version N+1. Dexie gere automatiquement les suppressions de champ.

**Alternatives considered**:
- Gestion manuelle : fragile et error-prone
- SQLite.js : trop lourd pour ce cas d'usage
- Table unique flat : perd l'efficacite des queries sur les photos

**Schema local Dexie** :
```
version(1):
  offlineVisites: "id, chantier_id, syncStatus, updated_at"
  offlineReponses: "id, visite_id, checklist_item_id, syncStatus"
  offlineEcarts: "id, visite_id, syncStatus, updated_at"
  offlinePhotos: "id, ecart_id, syncStatus, created_at"
```

## 4. @react-pdf/renderer avec images mobiles

**Decision**: @react-pdf/renderer v4 fonctionne de maniere fiable avec les images signees Supabase Storage sur mobile.

**Rationale**: Les signed URLs Supabase sont resolues par le navigateur, y compris sur iOS Safari et Android Chrome. La compression photo (max 1920px, <2MB, qualite 0.85→0.5) garantit des PDFs legers. Limite recommandee : 3 photos max par ecart pour eviter la pression memoire sur iOS.

**Alternatives considered**:
- Images base64 : bloat JSON de 30%, echoue hors-ligne
- PDFKit server-side : plus lent, necessite upload fichiers
- Canvas-based PDF : plus complexe, moins de support navigateur

**Recommandation** : Generer les PDFs cote client pour le MVP. Envisager la generation serveur pour les scenarios a gros volume.

## 5. Supabase RLS pour mono-tenant multi-utilisateurs

**Decision**: RLS avec isolation par org_id + policies role-based. Un seul role "inspecteur" pour le MVP.

**Rationale**: Pour le MVP mono-role, des policies simples basees sur l'authentification suffisent. Chaque table publique a RLS active. Les helper functions auth_org_id() et auth_user_role() sont encodees dans le JWT custom.

**Alternatives considered**:
- Auth au niveau application : plus lent, probleme de confiance
- BDD multiples par org : surdimensionne
- API key strategy : moins flexible que JWT + RLS

**Patterns RLS pour le MVP** :
- SELECT : `USING (true)` pour les tables de reference (Phase, ChecklistItem)
- SELECT/INSERT/UPDATE : `USING (auth.uid() IS NOT NULL)` pour les tables mutables
- Soft-delete : `AND deleted_at IS NULL` dans toutes les policies SELECT
- Service role : reserve aux operations systeme (seed, migrations)
