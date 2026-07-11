# 基线：已掌握 Responses API 原语，尚未形成 Agent 系统

根据仓库代码与 git 历史（`Responses-API` 分支，至 2026-07-10）建立的学习基线：学习者已能用 OpenAI-compatible Responses API 完成文本生成、Zod 结构化输出、单轮/流式 function calling，并接触 `previous_response_id` 与 custom tool；但尚未实现「直到任务完成」的多步 Agent Loop，也没有真实生产力工具、评测或交付形态。

## Evidence
- `TextGeneration.ts`：`responses.create` + `instructions` + `reasoning.effort`
- `StructuredOutput.ts`：`responses.parse`、refusal 分支、structured stream
- `FunctionCalling.ts`：工具 schema、`function_call` / `function_call_output` 回填、流式 tool 执行、`previous_response_id`、custom tool
- 提交顺序：text → structured → tools → stream tools → custom tools

## Implications
- 下一课应落在 **Agent Loop**（在已有 tool calling 之上加循环、步数上限、结束条件），这是 ZPD 中心。
- 不必重教 Chat Completions 或「什么是 LLM」。
- 结构化输出应保留为后续「计划 / 任务状态」的默认手段，而不是已结束的主题。
