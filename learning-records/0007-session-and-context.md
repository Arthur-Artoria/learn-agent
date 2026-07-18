# 0007 — 会话状态与上下文压缩

## 学到了什么
- **runAgent 的 stateless 问题**：每次调用 `currentInput` 初始化为 `[{ role: 'user', content: input }]`，多轮之间不共享历史——这是有意为之的无状态设计，但交付产品需要打破它
- **两条路径**：`previous_response_id`（平台托管，黑盒不可控）vs 自管 history 数组（透明、可序列化、不绑平台）——本课程选择后者
- **Context Budget**：对话只增不减，两维度约束——硬上限（模型 context window，128K 但 lost-in-the-middle 效应建议 50-70%）和成本（每 1K token 付费）
- **三种压缩策略**：滑动窗口（简单但丢远期）、摘要压缩（保留语义丢细节）、摘要 + 近期窗口（混合方案，多数生产 Agent 的选择）

## 为什么重要
L5 的 loop 只能跑"一次一个任务"。L7 的 session 让它能像真人对话一样多轮交互，记住上下文。这是从"能跑"到"能用"的转折——用户不会每次都把前因后果重新说一遍。

## 关键决策
- 自管 history 而非依赖 `previous_response_id`（L4 已验证两者差异）
- 压缩策略选 "摘要 + 近期窗口" 作为最终目标，但练习建议先从滑动窗口入手降低复杂度
- Session 落盘用本地 JSON（与 todo DB 一致的技术选择），后续可升级到 SQLite

## 待验证
- 压缩摘要的质量是否足够（关键信息是否丢失）
- 压缩触发的时机和阈值（token 数还是消息数？每次追加后还是定时？）
- 多轮 session 下的工具状态一致性（todo JSON 是共享的，多个 session 同时操作会怎样？）

## 相关代码（待创建）
- `src/Agent/session.ts` — SessionManager 类
- `src/Agent/loop.ts` — 改造接受可选 conversation 参数
- `src/main.ts` — 多轮对话验证脚本
