# 学习计划：从 Responses API 到可交付生产力 Agent

时间窗：**约 8 周** · 方式：**项目驱动** · 栈：本仓库 TypeScript + Responses API

> 难度不是按「酷炫程度」排的，而是按 **依赖顺序**。你已经做完第 0 层；第 1 层是现在最该补的。

---

## 你现在在哪（进度诊断）


| 层级  | 主题                  | 状态     | 你仓库里的证据                                                              |
| --- | ------------------- | ------ | -------------------------------------------------------------------- |
| L0  | LLM 调用 / 环境         | ✅ 已会   | `main.ts` + OpenAI client + `GODEX_BASE_URL`                         |
| L1  | 文本生成 + instructions | ✅ 已会   | `TextGeneration.ts`                                                  |
| L2  | 结构化输出 (Zod)         | ✅ 已会   | `StructuredOutput.ts`（含 stream / refusal）                            |
| L3  | 单轮 Tool Calling     | ✅ 已会   | `getHoroscopeFunctionCalling`                                        |
| L4  | 流式 Tool + 会话衔接      | ✅ 已会   | `getWeatherFunctionCalling` + `previous_response_id`；custom tool；课程 0004 |
| L5  | **完整 Agent Loop**   | ✅ 已会   | `src/Agent/loop.ts`（maxSteps、结束条件、轨迹日志）+ `src/Agent/trajectory.ts`       |
| L6  | 工具工程（真实副作用、错误、并行）   | ✅ 已会   | `src/tools/` 注册表 + Todo CRUD；错误返回字符串不抛异常 |
| L7  | 会话记忆与上下文管理          | 🔄 进行中  | 课程 0007 已讲；需自写 session.ts + 改造 loop.ts                                |
| L8  | 可靠性（护栏、日志、重试、评测）    | ❌ 缺口   | —                                                                    |
| L9  | 可演示的生产力 Agent 作品    | ❌ 目标   | Mission 的交付物                                                         |


**一句话**：Agent 核心骨架已就位（loop + 工具注册表 + 计划轨迹）。下一个分水岭是把**无状态 run** 变成**可恢复会话**。

### 各选项到底有多难？（对应你问卷里的困惑）


| 方向                | 相对难度 | 依赖           | 两月内是否该主攻             |
| ----------------- | ---- | ------------ | -------------------- |
| 完整 Agent Loop     | ★★☆  | L3–L4        | **必须，第 1 周**         |
| 记忆 / 会话 / 状态      | ★★★  | Loop 先稳定     | 第 3–4 周              |
| RAG + 工具编排        | ★★★☆ | Loop + 基本状态  | 有余力再加；非 MVP 必选项      |
| 多 Agent / 工作流     | ★★★★ | 单 Agent 可靠之后 | **刻意延后**（面试加分项，不是地基） |
| 继续啃 Responses API | ★☆   | 你已大部分完成      | 只在遇缺口时补读官方文档         |


「合格的生产力工具 Agent」= **L5–L8 做扎实 + L9 一个垂直场景做透**，不需要先会多 Agent。

---



## 总目标拆解

1. **工程能力**：能手写 Agent runtime（loop / tools / state / limits）
2. **作品**：一个你自己真会用的生产力 Agent（求职作品集核心）
3. **叙事**：15 分钟讲清架构决策与 trade-off（面试）

推荐作品方向（选 1，第 2 周末前定死）：


| 候选         | 典型工具              | 面试故事好讲吗       |
| ---------- | ----------------- | ------------- |
| A. 个人任务管家  | 待办 CRUD、日程摘要、提醒草稿 | 强：状态 + 工具副作用  |
| B. 研究/阅读助手 | 网页抓取、摘要、笔记落盘      | 强：工具链 + 结构化输出 |
| C. 本地代码小助手 | 读文件、跑命令、改小范围代码    | 强：但安全边界要讲清    |


默认建议：**A 或 B**（范围可控、演示稳定）。C 更炫但安全与权限话题更重。

> 我倾向于 A. 个人任务管家

---



## 八周课表



### 第 0 阶段（已完成）— Responses API 地基

- 文本生成、结构化输出、function calling、stream、custom tool 初探
- **验收**：能解释 `function_call` / `function_call_output` / `previous_response_id` 各自职责



### 第 1 周 — Agent 是什么 + 写出第一个 Loop ✅

**技能**：把单轮 tool calling 升级为 `runAgent(input)`  
**产出**：`src/agent/loop.ts` — `maxSteps`、结束条件、轨迹日志  
**主阅读**：[Function calling](https://developers.openai.com/api/docs/guides/function-calling) + [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) 前半  
**验收**：同一会话内可连续调用 ≥2 次工具并给出最终自然语言答案

### 第 2 周 — 工具工程 ✅

**技能**：工具注册表、参数校验、失败可重试、并行 tool calls  
**产出**：`src/tools/`* + 至少 2 个「真有用」的工具（文件读写 / HTTP / 本地 JSON 待办库 等）  
**主阅读**：[Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)  
**验收**：工具失败时 Agent 不崩；能向用户解释失败原因

### 第 3 周 — 指令、计划与结构化中间状态 ✅

**技能**：system/instructions 设计；用 Zod 强制「计划 → 行动 → 总结」  
**产出**：任务规划 schema + 执行轨迹可视化（console 或简单 markdown 报告）  
**主阅读**：OpenAI [Practical guide PDF](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)（用例与编排章）  
**验收**：复杂请求下可见「分步计划」，而不是黑盒一次喷完

### 第 4 周 — 会话、记忆与上下文预算

**技能**：多轮会话；`previous_response_id` vs 自管 history；摘要压缩  
**产出**：可恢复的 session（文件或 SQLite）；超长对话不炸 context  
**验收**：关掉进程再开，仍能接着上次任务聊

### 第 5 周 — 生产力 Agent MVP

**技能**：垂直场景端到端  
**产出**：CLI 或简单交互入口 + README 演示脚本（3 个典型用户故事）  
**验收**：陌生人按 README 能在 10 分钟内跑通一个完整任务

### 第 6 周 — 可靠性与可观测性

**技能**：步数/超时/费用护栏；结构化日志；最小评测集（10–20 条用例）  
**产出**：`eval/` 或脚本化回归；失败 case 可复现  
**主阅读**：Practical guide 中 guardrails 相关章节 + Anthropic tools 文中的 evaluation 思路  
**验收**：改 prompt/工具后能跑回归，知道有没有变差

### 第 7 周 — 作品抛光与面试叙事

**技能**：架构图、决策记录、live demo 脚本、常见面试问答  
**产出**：作品 README（问题 → 架构 → 演示 → 局限 → 下一步）  
**验收**：能脱稿讲 10 分钟：为什么是 Agent 而不是「一个 chatbot + if-else」

### 第 8 周 — 缓冲 / 加分项（二选一，勿全上）

- **加分 A**：轻量 RAG（本地 markdown 笔记检索）挂到现有 Agent  
- **加分 B**：一个 workflow 模式（固定步骤）与 agent 模式的对照实现，写清何时用哪个  
- **加分 C**：阅读 OpenAI Agents SDK 文档，用 1 页笔记对比「手写 loop vs SDK」

---



## 每周节奏（建议）


| 日   | 做什么                         |
| --- | --------------------------- |
| 1–2 | 读主阅读 + 一节短课（`lessons/`）     |
| 3–5 | 在仓库实现本周产出                   |
| 6   | 写/更新学习记录；给作品 README 补两段     |
| 7   | 休息或只做检索练习（默写 Agent Loop 步骤） |


---



## 课程单元索引（会随教学推进追加）


| #    | 课题                               | 状态     |
| ---- | -------------------------------- | ------ |
| 0001 | 进度地图与学习路线                        | ✅ 本课   |
| 0002 | Agent Loop：从单轮 tool 到 `runAgent` | ✅ 本课 |
| 0003 | 工具设计：schema、描述、错误面 | ✅ 本课 |
| 0004 | 流式调用与会话衔接 | ✅ 本课 |
| 0005 | 工具注册表与真实工具：从 switch-case 到可插拔轨道 | ✅ 本课 |
| 0006 | 结构化计划与轨迹：instructions 驱动 plan-before-act | ✅ 本课 |
| 0007 | 会话状态与上下文压缩                       | 🔄 本课  |
| …    | 对齐周课表继续拆                         |        |


---



## 如何与老师（Agent）配合

- 完成一课后直接追问：「这里为什么这样设计？」「帮我 review 我的 loop」
- 卡住超过 30 分钟：贴代码 + 期望行为 + 实际行为
- 想改 Mission（换作品方向、压缩到 4 周等）：先说，我们会更新 `MISSION.md` 并记一条 learning record

