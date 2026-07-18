# 0004 — 流式调用与会话衔接

## 学到了什么
- **流式事件模型**：`stream: true` 下响应分四个关键事件 —— `response.created`（拿 ID）、`response.output_item.done`（拿 function_call 完整信息）、`response.output_text.delta`（逐字文本）、`response.completed`（结束信号）
- **previous_response_id**：平台级对话续接机制，适合简单多轮串联；Agent Loop 内更适合手动拼接 input（透明可控）
- **内置工具类型**：`web_search_preview`、`code_interpreter`、`file_search`、`mcp` —— 平台自动执行，不需要自己写 executeTool
- **流式 + Loop 的取舍**：先跑稳非流式 Loop，流式是锦上添花而非核心需求

## 为什么重要
L4 是 L3（单轮 tool）和 L5（Agent Loop）之间的胶水层。不理解流式事件就无法写交互式 Agent；不理解 `previous_response_id` 就无法实现多轮会话。内置工具则是后续生产力 Agent 中「搜索」「代码执行」等能力的基础。

## 相关代码
- `src/ResponsesAPI/FunctionCalling.ts:96-143` — `getWeatherFunctionCalling` 流式 + previous_response_id 标准范例
- `src/Agent/loop.ts` — 当前非流式 Loop，未来可加流式支持

## 关键决策
- Agent Loop 内使用手动拼接 input，不用 `previous_response_id`
- 生产线工具用 `function` 类型（可控），辅助信息获取可用内置工具
- 流式调用必须同时 `store: true`

## 待验证
- 改造 `getHoroscopeFunctionCalling` 为流式版本
- 添加 `web_search_preview` 工具并观察 output 结构
