# US Healthcare Provider Lookup

A Next.js web application that lets you look up US healthcare providers by NPI number or name using the public [NPPES NPI Registry API](https://npiregistry.cms.hhs.gov/). Every search is persisted to a Neon Postgres database so you can revisit recent lookups from the history dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| ORM | [Prisma 7](https://www.prisma.io/) |
| Database | [Neon Postgres](https://neon.tech/) (serverless Postgres) |
| Package Manager | [pnpm](https://pnpm.io/) |
| Data Source | [NPPES NPI Registry API v2.1](https://npiregistry.cms.hhs.gov/api-page) |

---

## Features

- Search providers by **10-digit NPI number** or by **provider name** (individual or organization)
- Display provider details: name, credentials, NPI, state, taxonomy/specialty
- Persist every lookup to the database with query, result, and timestamp
- History dashboard showing recent lookups with the ability to view details
- Graceful error handling for invalid NPI, no results, API errors, and network failures

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm (`npm install -g pnpm`)
- A [Neon](https://neon.tech/) Postgres project (free tier is sufficient)

### 1. Clone & Install

```bash
git clone https://github.com/Melak12/us-healthcare-provider-lookup.git
cd us-healthcare-provider-lookup
pnpm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your Neon connection strings:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
# Pooled connection — used by Prisma Client at runtime
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
```

> **Where to find these strings**: In your Neon dashboard, open your project → **Connection Details**.  
> Select **Pooled connection** for `DATABASE_URL`. Make sure to select Prisma as a framework. 

### 3. Apply Database Migrations

Run the initial migration to create the `lookups` table.

```bash
npx prisma migrate dev --name init
```

This creates all tables defined in `prisma/schema.prisma`

### 4. Generate Prisma Client

If you change the schema, regenerate the client:

```bash
npx prisma generate
```

The generated client is output to `app/generated/prisma/`. Import the singleton from `lib/prisma.ts` in your server code.

### 5. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---



## Project Structure

```
├── app/
│   ├── actions/                # Server Actions (API calls, DB logic)
│   │   └── searchProviders.ts
│   ├── components/             # Shared React components
│   ├── data/                   # Static / mock data
│   │   └── searchResultDummy.ts
│   ├── generated/
│   │   └── prisma/             # Auto-generated Prisma Client (do not edit)
│   ├── globals.css             # Tailwind global styles
│   ├── history/                # History dashboard pages
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── search-result/          # Search result pages
│   │   ├── loading.tsx
│   │   └── page.tsx
│   └── types/                  # Shared TypeScript types
│       └── nppes.ts
├── lib/
│   ├── lookupService.ts        # NPPES API integration logic
│   └── prisma.ts               # Prisma Client singleton
├── prisma/
│   ├── migrations/             # SQL migration history
│   │   └── 20260430000000_init/
│   │       └── migration.sql
│   ├── schema.prisma           # Database schema
│   └── prisma.config.ts        # Prisma 7 configuration (datasource URLs)
├── .env.example                # Environment variable template
├── eslint.config.mjs           # ESLint config
├── next-env.d.ts               # Next.js type declarations
├── next.config.ts              # Next.js config
├── package.json                # Project manifest
├── pnpm-lock.yaml              # pnpm lockfile
├── pnpm-workspace.yaml         # pnpm workspace config
├── postcss.config.mjs          # PostCSS config
├── README.md                   # Project documentation
├── tsconfig.json               # TypeScript config
└── public/                     # Static assets (if any)
```

---

## Database Schema

The `Lookup` model stores every provider search:

| Field | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Primary key |
| `query` | `String` | The search term entered by the user |
| `queryType` | `String` | `"npi"` or `"name"` |
| `npi` | `String?` | NPI number extracted from the result |
| `resultJson` | `Json?` | Full NPPES API response |
| `success` | `Boolean` | Whether the lookup returned results |
| `errorMessage` | `String?` | Error detail when `success = false` |
| `timestamp` | `DateTime` | When the lookup was triggered |
| `createdAt` | `DateTime` | Row creation timestamp |

---

## Design Decisions

The app uses **Next.js Server Actions** instead of API Route Handlers for all data mutations (saving lookups, querying the NPPES API), keeping the data-fetching logic co-located with the UI and eliminating the need for a separate REST layer. The Prisma Client is instantiated as a **global singleton** (`lib/prisma.ts`) to avoid connection pool exhaustion during Next.js hot-reloads in development. **Prisma 7** uses the Driver Adapter pattern — the client is initialised with `@prisma/adapter-neon` (wrapping `@neondatabase/serverless`) using the pooled `DATABASE_URL`, while the Prisma CLI uses `DIRECT_URL` (direct connection, no PgBouncer) for schema migrations.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `npx prisma generate` | Regenerate Prisma Client after schema changes |
| `npx prisma migrate dev` | Apply pending migrations in development |
| `npx prisma studio` | Open Prisma Studio (visual DB browser) |

