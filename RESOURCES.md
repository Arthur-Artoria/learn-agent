# Agent 开发 Resources

## Knowledge

- [OpenAI: Function calling](https://developers.openai.com/api/docs/guides/function-calling)
  Tool calling 五步流程、function tools vs custom tools。Use for: 你当前代码对应的官方主线；Agent Loop 的「一步」长什么样。
- [OpenAI: Using tools](https://developers.openai.com/api/docs/guides/tools)
  内置工具、function calling、MCP、tool search 总览。Use for: 知道平台能提供哪些能力，避免把一切都自己写。
- [OpenAI: Agents overview](https://developers.openai.com/api/docs/guides/agents)
  Responses API 手工编排 vs Agents SDK 的职责边界。Use for: 面试时讲「何时手写 loop、何时用 SDK」。
- [OpenAI PDF: A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
  用例选择、编排模式、工具与 guardrails 的产品/工程指南。Use for: 设计「什么值得做成 Agent」、单 Agent → 多 Agent 的决策。
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
  强调简单可组合模式（workflow vs agent）、透明规划。Use for: 架构直觉与反过度工程；与 OpenAI 指南对照读。
- [Anthropic: Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
  工具设计、评测、用 Agent 优化工具描述。Use for: 生产力 Agent 的 tool schema / description 打磨。
- [OpenAI: Structured Outputs (via SDK helpers)](https://developers.openai.com/api/docs/guides/structured-outputs)
  结构化输出与 schema 约束。Use for: 规划步骤、任务列表等中间状态的类型安全。
- [OpenAI Agents SDK (Python docs)](https://openai.github.io/openai-agents-python/)
  官方 SDK 概念（tools、handoffs、guardrails）。Use for: 对照阅读；主实现仍保持 TS + Responses API。

## Wisdom (Communities)

- [OpenAI Developer Community](https://community.openai.com/)
  API 行为、SDK 边界案例。Use for: 遇到 Responses / tool 调用怪问题时搜帖。
- [r/AI_Agents](https://www.reddit.com/r/AI_Agents/)
  实践讨论与架构吐槽。Use for: 作品方向与「生产环境踩坑」的二手经验（需自行过滤营销帖）。
- [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/)（可选）
  模型能力与工具调用实测氛围。Use for: 了解模型能力边界，非本课主线。

## Gaps

- 尚缺一份「TypeScript + Responses API 完整 agent loop」的一等公民官方教程（需我们用官方 function-calling 文档自己拼出）。
- 生产力场景的领域数据（日历 / 待办 API 等）尚未选定，选定后补官方 API 文档条目。
