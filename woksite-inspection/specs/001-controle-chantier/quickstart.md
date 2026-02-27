# Quickstart: Controle Chantier

## Pre-requis

- Node.js 20+ et npm
- Compte Supabase (projet cree avec PostgreSQL)
- Compte Resend (pour les notifications email)

## Installation

```bash
cd woksite-inspection
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install @supabase/supabase-js @supabase/ssr dexie dexie-react-hooks
npm install @react-pdf/renderer serwist
npm install react-signature-canvas resend
npm install -D supabase @serwist/next
```

## Configuration

```bash
cp .env.example .env.local
```

Variables requises dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=securite@votredomaine.ch
```

## Base de donnees

```bash
npx supabase init
npx supabase db push         # Applique les migrations
npx supabase db seed          # Charge les phases et checklist items
```

## Demarrage

```bash
npm run dev
```

Ouvrir http://localhost:3000 sur un navigateur mobile ou en mode responsive.

## Verification rapide

1. Acceder au dashboard → voir la liste des chantiers (vide au debut)
2. Creer un chantier via "Nouveau chantier"
3. Associer une entreprise au chantier
4. Lancer une visite → selectionner Phase 1
5. Repondre aux points de controle
6. Creer un ecart sur un point "Non Conforme"
7. Terminer la visite → verifier l'historique
8. Generer le rapport PDF
9. Tester le bouton STOP Danger depuis n'importe quel ecran

## Structure du projet

```
woksite-inspection/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Layout principal + bouton STOP Danger
│   │   ├── page.tsx            # Dashboard
│   │   ├── chantiers/
│   │   │   ├── page.tsx        # Liste chantiers
│   │   │   ├── nouveau/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Detail chantier + timeline visites
│   │   │       ├── entreprises/page.tsx
│   │   │       └── visites/
│   │   │           ├── nouvelle/page.tsx
│   │   │           └── [visiteId]/
│   │   │               ├── page.tsx    # Formulaire inspection
│   │   │               └── rapport/page.tsx
│   │   └── api/
│   │       ├── ecarts/
│   │       │   ├── stop-danger/route.ts
│   │       │   └── [id]/transition/route.ts
│   │       ├── visites/[id]/pdf/route.ts
│   │       └── notifications/stop-danger/route.ts
│   ├── components/
│   │   ├── ui/                 # Composants Tailwind reutilisables
│   │   ├── dashboard/          # Composants dashboard
│   │   ├── inspection/         # Composants visite/checklist
│   │   ├── ecart/              # Formulaire ecart + photo
│   │   ├── stop-danger/        # Bouton + modal STOP
│   │   └── pdf/                # Templates rapport PDF
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Client browser
│   │   │   ├── server.ts       # Client server-side
│   │   │   └── middleware.ts   # Auth middleware
│   │   ├── dexie/
│   │   │   └── db.ts           # Schema IndexedDB offline
│   │   ├── notifications/
│   │   │   └── email.ts        # Integration Resend
│   │   └── utils/
│   │       └── ecart-state.ts  # State machine ecart
│   └── types/
│       └── database.ts         # Types generes Supabase
├── supabase/
│   ├── migrations/             # Migrations SQL
│   └── seed.sql                # Phases + checklist items OTConst/SUVA
├── public/
│   └── sw.js                   # Service Worker (Serwist)
└── tests/
    ├── unit/
    └── integration/
```
