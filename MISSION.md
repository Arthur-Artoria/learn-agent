# Mission: Agent 工程能力（求职 + 可交付生产力工具）

## Why
在约两个月内，把「会调 LLM API」升级成「能独立设计并交付一个合格生产力 Agent」，形成可演示的作品与可讲清的工程故事，从而在求职中拉开差距。

## Success looks like
- 能从零写出 **Agent Loop**（多轮 tool 调用、步数上限、结束条件、错误恢复），不依赖框架黑盒
- 交付一个 **可日常使用的生产力 Agent 原型**（有真实工具、可多轮会话、有基本可靠性）
- 能用清晰架构图与代码 walkthrough 向面试官解释：模型 / 工具 / 状态 / 护栏如何协作
- 能对比并判断：何时用 raw Responses API、何时引入 Agents SDK / 工作流模式

## Constraints
- 技术栈以本仓库为准：TypeScript + Bun + OpenAI Responses API + Zod
- 学习方式：**项目驱动**（每阶段产出可运行代码）
- 时间窗约 **8 周**；优先单 Agent 做深，不提前堆多 Agent

## Out of scope
- 训练 / 微调模型、RLHF 等研究向内容
- 一上来就做复杂 Multi-Agent 框架或「造轮子平台」
- 仅为刷框架名词而频繁换栈（LangGraph / CrewAI 等仅作对照阅读，不作为主实现）
