# Teaching Notes

## Preferences
- 语言：中文讲解为主；代码与 API 术语保留英文
- 方式：项目驱动，代码落在本仓库 `src/`
- 目标：求职竞争力 + 两个月内做出合格生产力 Agent
- 对「Agent Loop / 记忆 / RAG / 多 Agent」的难易区分尚不清晰 → 教学中要先给难度地图，再推进

## Prior art in this repo (as of 2026-07-10)
- Branch: `Responses-API`
- Stack: Bun, TypeScript (strict), `openai` SDK, `zod`
- Client: custom `GODEX_BASE_URL`（兼容 OpenAI-style Responses API）
- Modules under `src/ResponsesAPI/`:
  - `TextGeneration.ts` — `responses.create`, `instructions`, `reasoning.effort`
  - `StructuredOutput.ts` — `responses.parse` + Zod, refusal handling, structured stream
  - `FunctionCalling.ts` — tools schema, single-round tool loop, stream tool calls, `previous_response_id`, custom tool
- `main.ts` currently runs `getCustomToolCalling`；其他 demo 以注释切换

## Lesson authoring rules
- 每课底部必须包含 `<nav class="lesson-nav">` 导航栏，连接上一课、课程索引、下一课
- 每课必须包含 theme toggle 按钮和对应 JS（复制已有课程的 pattern）
- 课程编号递增（`0001-`, `0002-`, ...），文件名用 dash-case

## Environment constraints
- llm provider is DeepSeek (via GODEX_BASE_URL proxy); OpenAI built-in tools (web_search_preview, code_interpreter, file_search) are NOT supported. Only `type: 'function'` tools work.
- `web_search_preview` was tested in L4 but removed due to this constraint; keep as conceptual knowledge only.

## Teaching posture
- 先巩固「API 原语 → Agent 原语」的映射，再选生产力场景做 MVP
- 面试叙事：不是「调了几个 API」，而是「我能把不可靠的模型调用收成可控系统」
- 每课一个小 win；课程大纲见 `CURRICULUM.md`
