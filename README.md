# Student Roadmap AI

A platform for middle school and high school students to get personalized academic roadmaps, college competitiveness estimates, and research-backed recommendations.

## Features

- **Accounts**: Email/password sign-up and sign-in (NextAuth.js / Auth.js, JWT sessions, bcrypt password hashing)
- **Student profile intake**: Name, age, grade, GPA, classes, interests, intended majors, target colleges, extracurriculars, awards, leadership, and more
- **AI-generated analysis**: Student summary, strengths, gaps, recommended activities, projects, coursework, competitions, internships
- **Timelines**: 3-month, 6-month, and 12-month action plans
- **College competitiveness**: Tier estimates (reach/target/safety) for target schools
- **Top actions**: Prioritized recommendations to improve competitiveness
- **Research citations**: Evidence panel with sources

**Disclaimer**: All outputs are guidance only. The platform does not guarantee admission to any college or program.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js route handlers, Prisma ORM
- **Auth**: NextAuth.js v5 (credentials provider), JWT sessions
- **Database**: PostgreSQL (pgvector-compatible schema for future RAG/embeddings)
- **Intelligence**: OpenAI API for roadmap generation (falls back to deterministic mock when no API key)

## Environment variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes (production) | Secret for signing sessions. Generate: `openssl rand -base64 32` |
| `AUTH_URL` | Production | Public app URL, e.g. `https://yourdomain.com` |
| `OPENAI_API_KEY` | No | If omitted, roadmap uses deterministic mock data |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |
| `ADMIN_BOOTSTRAP_EMAIL` | No | Used only by `npx prisma db seed` to create/update an admin |
| `ADMIN_BOOTSTRAP_PASSWORD` | No | Password for the seeded admin user |

Legacy aliases `NEXTAUTH_SECRET` / `NEXTAUTH_URL` still work with NextAuth.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Setup

1. Clone and install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `AUTH_SECRET`.

3. Apply database schema and generate Prisma Client:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

   If you use an existing database, run migrations with `npx prisma migrate deploy` in production.

4. (Optional) Create or update an **admin** user via seed:

   ```bash
   # In .env
   ADMIN_BOOTSTRAP_EMAIL=you@example.com
   ADMIN_BOOTSTRAP_PASSWORD=your-secure-password

   npx prisma db seed
   ```

   Or promote a user manually in SQL:

   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Authentication

- **Sign up**: `/signup` — creates a `User` (password hashed with bcrypt) and an empty `StudentProfile` linked to that user.
- **Sign in**: `/login` — email/password; invalid credentials show a generic error message.
- **Sign out**: Available from the home header (when logged in), dashboard, and admin pages.
- **Protected routes** (middleware): `/intake`, `/dashboard`, `/roadmap/*` require login. `/admin/*` requires role `ADMIN`.
- **Data scoping**: Student profiles and roadmaps are tied to `User` via `StudentProfile.userId`. API routes verify ownership before returning or mutating data.

### Creating a roadmap (logged-in flow)

1. Sign up or log in.
2. Open **Dashboard** → **Start intake** (or go to `/intake`).
3. Complete the profile form and submit — it updates **your** profile (same `StudentProfile` id as in the database).
4. You are redirected to `/roadmap/[profileId]`; analysis runs if needed.

### OpenAI Integration

Roadmap generation uses the OpenAI API when configured.

1. Add your API key to `.env`:

   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   ```

2. **Prompt**: `src/lib/ai/build-roadmap-prompt.ts`

3. **Schema / Types**: `src/types/openai-roadmap.ts`, `src/lib/ai/validate-roadmap.ts`

4. **Demo mode**: Without `OPENAI_API_KEY`, the app uses `src/lib/ai/mock-roadmap.ts`.

### Python Intelligence Service (Optional)

For LLM or retrieval-based analysis, use the Python service:

```bash
cd python
pip install -r requirements.txt
```

The Next.js app primarily uses in-process TypeScript analysis and OpenAI.

### Database notes

- **Legacy data**: If you had `StudentProfile` rows before auth, they may have `userId = null`. Those rows are not accessible through the new authenticated API until you attach them to a `User` (manual SQL or a one-off migration).

### PostgreSQL / pgvector (optional)

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Troubleshooting: `P1001 Can't reach database server`

Prisma could not open a TCP connection to Postgres. Common causes:

1. **Wrong `DATABASE_URL`** — Copy the URI from your host’s dashboard (Neon, Supabase, etc.). For **Neon**, use the string they provide and ensure it includes **`?sslmode=require`** (or `sslmode=no-verify` only if their docs say so).
2. **Neon project asleep** — Free-tier databases suspend after inactivity. Open the [Neon console](https://console.neon.tech), select your project, and wake it (or run a query). Retry `npx prisma migrate dev` after the DB is active.
3. **Network / firewall / VPN** — Corporate networks sometimes block outbound port `5432`. Try another network, disable VPN, or use Neon's **pooler** vs **direct** connection if one works and the other does not.
4. **Env not loaded** — Confirm `.env` is in the project root and `DATABASE_URL` has no typos or smart quotes. Restart the terminal after editing.

Quick test (requires `psql` or Neon SQL editor): connect with the same URL Prisma uses.

5. **Neon branch deleted or project removed** — If the project was deleted or the branch ID changed, the hostname (`ep-wild-bonus-...`) no longer resolves. Create a new Neon project and replace `DATABASE_URL` with the new connection string from the dashboard.

## Project Structure

```
├── prisma/
│   ├── schema.prisma       # User, StudentProfile, Roadmap
│   ├── migrations/
│   └── seed.mjs            # Optional admin bootstrap
├── src/
│   ├── auth.ts             # NextAuth configuration
│   ├── middleware.ts       # Route protection
│   ├── app/
│   │   ├── api/auth/       # NextAuth + register
│   │   ├── login/, signup/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── intake/
│   │   └── roadmap/[id]/
│   └── components/
└── package.json
```

## License

MIT
