# AGENTS.md

## Runtime & commands

- **Bun** is the runtime. `bun run src/main.ts` is the only command. No build step (`noEmit: true`).
- `bun install` for dependencies. No npm/yarn/pnpm.
- No test/lint scripts exist. This is a learning repo, not a production app.

## Architecture

- `src/main.ts` — entry point. Creates an OpenAI client using `GODEX_BASE_URL` from `.env`, then calls **one** demo function at a time. All other calls are commented out.
- `src/ResponsesAPI/` — flat module structure. Each file demonstrates one API capability:
  - `TextGeneration.ts` — basic `responses.create()`
  - `StructuredOutput.ts` — `responses.parse()` with Zod schemas, plus streaming structured output
  - `FunctionCalling.ts` — single-round, streaming, and custom tool calling
- `src/Homework/` — starter code for assignments (incomplete).
- `lessons/` — interactive HTML lesson pages. `assets/styles.css` — shared stylesheet.
- Key docs: `MISSION.md` (goals & constraints), `CURRICULUM.md` (progress map & 8-week schedule), `NOTES.md` (teacher context).

## API quirks

- Uses the **OpenAI Responses API** (`client.responses.*`), not Chat Completions. The SDK version is **openai v6.44.0**.
- `GODEX_BASE_URL` is a local OpenAI-compatible proxy (`.env` sets it to `http://0.0.0.0:5678/v1`).
- Zod v4 (`zod@4.4.3`) for structured output schemas. Note: Zod v4 API may differ from v3 docs.

## Learning context

- Goal: build a production-quality productivity Agent in ~8 weeks.
- Current progress: L0–L3 done (text gen, structured output, single-round tool calling). **L5 (Agent Loop with while/maxSteps) is the immediate gap.**
- Constraints from MISSION.md: TypeScript + Bun + OpenAI Responses API + Zod; single Agent only; no multi-agent or framework-hopping.
