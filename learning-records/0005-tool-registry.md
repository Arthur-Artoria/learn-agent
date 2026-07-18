# 0005 — 工具注册表与真实工具

## 学到了什么
- **ToolRegistry**：集中管理工具 schema 和 execute 的容器 —— 替代硬编码 switch-case，三个方法 `register` / `getSchemas` / `execute`
- **错误即信息**：工具失败返回 `"Error: ..."` 字符串而非抛异常，让模型自主决定下一步（重试、换参数、告知用户）
- **真实副作用**：Todo CRUD 基于本地 JSON 文件，模型的操作实际改变了文件状态
- **并行 tool calls**：模型可在一次响应中发出多个 function_call（如同时添加 3 条待办），Agent Loop 逐条执行后一次性回填

## 为什么重要
这是 Agent 从"玩具"到"工具"的分界线。Mock 字符串只能验证通路，真实文件 I/O 才暴露工程问题：并发写入、文件不存在、编码、参数校验。错误处理策略（返回 error vs throw）决定了 Agent 面对意外时的健壮性。

## 代码结构
```
src/tools/
  registry.ts   — Tool 接口 + ToolRegistry 类
  todo.ts       — 4 个 Todo 工具（add/list/complete/delete）+ 本地 JSON 读写
  index.ts      — 导出
src/Agent/loop.ts — 改用 registry.getSchemas() / registry.execute()
```

## 关键决策
- `import.meta.dirname` 确定 DB 路径（Bun 特性，Node 不兼容）
- `todos.json` 初始化为空数组 `[]` —— 文件不存在时优雅降级
- 工具 execute 返回类型统一为 `Promise<string>`（成功和错误都走字符串）

## 待扩展
- 工具参数用 Zod 校验（配合 L2 的结构化输出能力）
- 添加 `todo_search` 工具（按关键词搜索）
- 工具执行超时控制
