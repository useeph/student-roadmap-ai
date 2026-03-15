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
- **Intelligence**: OpenAI API for roadmap generation (falls back to deterministic mock when no API key)

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

### OpenAI Integration

Roadmap generation uses the OpenAI API when configured.

1. **Add your API key** to `.env`:

   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   ```

2. **Model**: `OPENAI_MODEL` defaults to `gpt-4o-mini` (good balance of quality and cost). You can switch to `gpt-4o` for higher quality. The model must support `response_format: { type: "json_object" }`.

3. **Prompt**: The system and user prompts live in `src/lib/ai/build-roadmap-prompt.ts`. Edit this file to adjust tone, constraints, or output structure.

4. **Schema / Types**: The expected OpenAI response shape is defined in:
   - `src/types/openai-roadmap.ts` (TypeScript interfaces)
   - `src/lib/ai/validate-roadmap.ts` (Zod schema for server-side validation)

5. **Demo mode**: When `OPENAI_API_KEY` is missing, the app uses deterministic mock data from `src/lib/ai/mock-roadmap.ts`. No crash, no API call—just a notice that demo data is being shown.

6. **Modular design**: The OpenAI client is in `src/lib/ai/openai-client.ts`. To swap providers later, replace the `generateRoadmapWithOpenAI` implementation while keeping the same interface and types.

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
