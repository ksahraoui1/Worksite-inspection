# Research: SST-QuickRef — Assistant IA Réglementaire

**Feature**: 001-sst-quickref-assistant  
**Date**: 2026-04-02

## 1. Modèle d'embedding

**Decision**: text-embedding-3-small (OpenAI)  
**Rationale**: Coût optimal (~CHF 0.0001/requête), dimension 1536 suffisante pour un corpus réglementaire de ~4480 chunks (39 sources). La précision est adéquate pour des textes juridiques structurés en français. Le rapport de développement confirme ce choix.  
**Alternatives considered**:
- text-embedding-3-large : meilleure précision mais coût 5x supérieur, non justifié pour un corpus restreint et bien structuré
- Embedding local (e.g., sentence-transformers) : pas d'infrastructure GPU disponible, complexité opérationnelle accrue

## 2. Taille des chunks

**Decision**: 512 tokens maximum, découpage par article/alinéa/bloc thématique  
**Rationale**: Les textes réglementaires SST sont naturellement structurés par articles et alinéas. Un découpage sémantique par article préserve le contexte juridique complet d'une disposition. 512 tokens offrent un bon compromis entre contexte suffisant et précision de la recherche vectorielle.  
**Alternatives considered**:
- 256 tokens : meilleure précision de recherche mais risque de perdre le contexte d'un article complet
- 1024 tokens : trop de bruit dans les résultats, dilution de la pertinence

## 3. Nombre de chunks retournés (top-K)

**Decision**: Top-5 chunks par similarité cosinus  
**Rationale**: Top-5 offre suffisamment de contexte pour couvrir des questions touchant à plusieurs articles liés, tout en restant sous la limite de tokens du prompt Claude (~4000 tokens de contexte RAG). Le rapport recommande top-5 pour la Phase 1.  
**Alternatives considered**:
- Top-3 : plus rapide et moins de tokens, mais risque de manquer des articles pertinents pour les questions transversales
- Top-10 : trop de contexte, augmente la latence et le coût API, risque de confusion pour le LLM

## 4. Seuil de pertinence (score de similarité cosinus)

**Decision**: Seuil minimum de 0.75 sur le score de similarité cosinus. En dessous, le système refuse de répondre et affiche "Aucun texte réglementaire trouvé".  
**Rationale**: Un seuil de 0.75 est conservateur et adapté à un domaine réglementaire où la confiance prime. Ce seuil sera calibré lors de la validation sur les 50 questions de référence et ajusté si nécessaire.  
**Alternatives considered**:
- Seuil 0.60 : trop permissif, risque de réponses hallucidées sur des sujets tangentiellement liés
- Seuil 0.85 : trop strict, risque de refuser des questions légitimes formulées différemment du texte source
- Pas de seuil (confidence label) : rejeté car incompatible avec le positionnement "référence réglementaire fiable"

## 5. LLM pour la génération de réponses

**Decision**: Claude Sonnet (Anthropic API)  
**Rationale**: Excellent raisonnement en français, respect des instructions de citation, disponible via API. Le rapport confirme ce choix. Coût estimé ~CHF 0.003/requête (500 tokens input + 300 tokens output).  
**Alternatives considered**:
- Claude Haiku : moins cher mais qualité de raisonnement juridique insuffisante pour des citations précises
- GPT-4o-mini : comparable en coût mais nécessite un second fournisseur API et diverge de l'écosystème Anthropic

## 6. Authentification et rate limiting

**Decision**: JWT Supabase pour les utilisateurs authentifiés (Securionis), rate limiting IP-based pour le freemium (10 req/jour).  
**Rationale**: Le JWT Supabase est déjà en place pour Securionis Inspect. Pour le freemium, un rate limiting par IP est simple à implémenter et suffisant pour la Phase 1. Les limitations connues (IP partagées, VPN) sont acceptables pour le volume cible.  
**Alternatives considered**:
- Token API dédié : overhead d'inscription pour un utilisateur de démo, friction excessive
- Browser fingerprinting : complexe, problèmes de fiabilité et de privacy (nLPD)
- Cookie-based : facilement contournable mais pourrait compléter l'IP en Phase 2

## 7. Frontend standalone vs intégré

**Decision**: SPA Vue 3 + Vite autonome pour la landing page et le chat (Phase 1). Intégration dans Securionis Inspect via API REST + bouton contextuel (Phase 2).  
**Rationale**: Vue 3 est le choix du rapport pour le frontend autonome. L'intégration Securionis se fait côté API (le frontend Securionis est en Next.js et consomme l'endpoint REST). Les deux frontends sont découplés.  
**Alternatives considered**:
- Tout dans Next.js (Securionis) : couple trop fortement QuickRef à Securionis, empêche la landing page autonome
- Widget iframe embarqué : UX dégradée, problèmes de CSP, complexité de communication cross-origin

## 8. Stratégie de versioning des documents

**Decision**: Chaque chunk possède un champ `is_superseded` (boolean) et `version_date`. Lors d'une mise à jour, les anciens chunks sont marqués `is_superseded = true`. La recherche vectorielle filtre par défaut sur `is_superseded = false`. Les versions antérieures sont consultables via un filtre explicite.  
**Rationale**: Conforme à la clarification spec (versioning avec priorisation). Permet la traçabilité légale (un inspecteur peut prouver quelle version il a consultée) sans polluer les résultats courants.  
**Alternatives considered**:
- Suppression des anciens chunks : perte de traçabilité légale, non acceptable pour un outil d'audit SST
- Versioning complet côte à côte : surcharge l'UX et les résultats de recherche

## 9. Anonymisation des logs

**Decision**: Anonymisation côté Edge Function avant insertion dans `quickref_queries`. La question est stockée après suppression des noms propres détectés (regex patterns suisses : noms d'entreprises, adresses, noms de personnes). Aucune donnée personnelle en clair dans les logs.  
**Rationale**: Conformité nLPD/RGPD. Les logs sont nécessaires pour l'amélioration continue mais ne doivent contenir aucune donnée identifiable. Rétention 90 jours.  
**Alternatives considered**:
- Pas de logs : impossible d'améliorer la qualité du service
- Logs complets avec accès restreint : risque de non-conformité nLPD, responsabilité juridique

## 10. Hébergement et région

**Decision**: Supabase projet dédié en région EU (Frankfurt) pour QuickRef, ou extension du projet Securionis existant.  
**Rationale**: Conformité RGPD/nLPD (hébergement EU). Le projet Securionis est déjà en EU. L'utilisation du même projet simplifie l'authentification JWT partagée.  
**Alternatives considered**:
- Projet Supabase séparé : isolation plus forte mais complexifie le SSO et l'intégration Phase 2
- Hébergement hors EU : non conforme nLPD pour les données de professionnels suisses
