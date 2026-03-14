# Student Roadmap AI

A platform for middle school and high school students to get personalized academic roadmaps, college competitiveness estimates, and research-backed recommendations.

## Features

- **Student profile intake**: Name, age, grade, GPA, classes, interests, intended majors, target colleges, extracurriculars, awards, leadership, and more
- **AI-generated analysis**: Student summary, strengths, gaps, recommended activities, projects, coursework, competitions, internships
- **Timelines**: 3-month, 6-month, and 12-month action plans
- **College competitiveness**: Tier estimates (reach/target/safety) for target schools
- **Top actions**: Prioritized recommendations to improve competitiveness
- **Research citations**: Evidence panel with sources

**Disclaimer**: All outputs are guidance only. The platform does not guarantee admission to any college or program.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, App Router
- **Backend**: Next.js route handlers, Prisma ORM
- **Database**: PostgreSQL (pgvector-compatible schema for future RAG/embeddings)
- **Intelligence**: TypeScript mock analysis (Python service available for LLM integration)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- (Optional) Python 3.9+ for the Python intelligence service

### Setup

1. Clone and install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your `DATABASE_URL`:

   ```bash
   cp .env.example .env
   ```

3. Run Prisma migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Python Intelligence Service (Optional)

For LLM or retrieval-based analysis, use the Python service:

```bash
cd python
pip install -r requirements.txt
# Run via stdin/stdout: echo '{"name":"Alex",...}' | python -m intelligence.analyze
```

The Next.js analysis currently uses the in-process TypeScript `runAnalysis` in `src/lib/analysis.ts`. To plug in the Python service, call it from `runAnalysis` via `child_process.spawn` and parse JSON from stdout.

### Database

PostgreSQL schema is pgvector-ready. To enable vector extensions for future RAG:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Project Structure

```
├── prisma/
│   └── schema.prisma       # StudentProfile, Roadmap models
├── python/
│   ├── intelligence/
│   │   └── analyze.py      # Python analysis service (mock/LLM-ready)
│   └── requirements.txt
├── src/
│   ├── app/
│   │   ├── api/            # profile, analyze, roadmap routes
│   │   ├── intake/         # Profile form page
│   │   ├── roadmap/[id]/   # Roadmap results page
│   │   └── page.tsx        # Landing page
│   ├── components/         # UI components
│   ├── lib/                # db, utils, analysis
│   └── types/              # Shared types
└── package.json
```

## License

MIT
