# Lesson 0002: Agent Loop 概念与骨架设计

完成了从「单轮 tool calling」到「Agent Loop」的概念跨越。理解了 Agent 的核心定义（while loop + maxSteps + 轨迹），并确认了从现有代码出发的实现路径。

## Key insights
- Agent Loop 不需要新 API——就是在已有的 tool calling 五步外包一层 `while` + 计数 + `break`
- Anthropic 的简洁定义：Agents are LLMs using tools based on environmental feedback in a loop.
- 三个终止条件：无 tool call（自然完成）/ maxSteps 触顶 / 工具失败（后续课程加入）
- 轨迹（trajectory）是 Agent 的日志系统——每一步的 model output + tool calls + tool results
- 现有代码 `getHoroscopeFunctionCalling` 已包含 loop 所需的所有原子操作，只是被 unroll 了一轮

## Evidence
- 能区分 Agent Loop 与单轮 tool calling 的本质差异
- 能写出 `runAgent()` 的核心伪代码骨架（while / filter function_call / break / push output）
- 能解释 maxSteps 的防护意义

## Implications
- 下一课（0003）或课后实践：在 `src/agent/loop.ts` 中实现可运行的 Agent Loop
- 后续展开：并行工具执行、错误恢复、结构化轨迹日志
