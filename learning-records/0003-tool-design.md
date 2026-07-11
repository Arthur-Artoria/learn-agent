# Lesson 0003: 工具设计规范与注册表模式

理解了 Agent Tool 与传统 API 的本质差异：Tool 是非确定性 LLM 与确定性代码之间的接口。掌握了工具定义的三个支柱（name、description、parameters）和错误处理原则。

## Key insights
- Tool ≠ API：调用方是 LLM（非确定性），不是程序员。tool 描述是给模型看的"使用说明书"
- description 是 80% 的功夫：好的描述回答"做什么、何时用、返回什么、边界"
- `additionalProperties: false` + `strict: true` 是防幻觉护栏
- 工具失败返回自然语言错误 + 修正建议，永远不要 throw
- 工具注册表模式（Map + registerTool + getToolSchemas + executeTool）让 Agent Loop 与具体工具解耦
- Anthropic 建议：少而精的工具 > 堆砌 API wrapper；一个 `schedule_event` 好过 `list_users` + `list_events` + `create_event`

## Evidence
- 能区分好/差 tool definition 的关键差异
- 能解释错误处理为什么必须返回自然语言而非抛异常
- 理解注册表模式如何让 Agent Loop 与工具解耦

## Implications
- 下一课或课后实践：实现 `src/tools/registry.ts` + 任务管家工具（add_todo, list_todos）
- 后续展开：并行工具执行、工具评测、工具描述优化迭代
