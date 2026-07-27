# TaskMate CLI —— 个人任务管家 Agent

基于 **OpenAI Responses API** 手写的 Agent 生产力工具。用自然语言管理待办事项，支持多轮工具调用、会话持久化、结构化执行轨迹。

## 快速开始

```bash
# 1. 安装依赖
bun install

# 2. 创建 .env，填入兼容 OpenAI Responses API 的端点
echo GODEX_BASE_URL=http://0.0.0.0:5678/v1 > .env
echo GODEX_API_KEY=any >> .env

# 3. 启动
bun start
```

启动后进入交互式 CLI，输入自然语言即可管理待办。

## 架构总览

```
┌──────────────────────────────────────────────────┐
│  main.ts (CLI REPL)                              │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ SessionMgr   │  │ ToolRegistry             │  │
│  │ (load/save/  │  │ (register/execute/       │  │
│  │  compress)   │  │  getSchemas)             │  │
│  └──────┬───────┘  └───────────┬──────────────┘  │
│         │                      │                  │
│  ┌──────▼──────────────────────▼──────────────┐  │
│  │  Agent Loop (loop.ts)                      │  │
│  │  · while steps < maxSteps:                 │  │
│  │    · call model → get output               │  │
│  │    · filter function_calls                 │  │
│  │    · execute tools → function_call_output  │  │
│  │    · append to conversation                │  │
│  │  · retry (retry.ts)                        │  │
│  │  · trajectory log (trajectory.ts)          │  │
│  └────────────────────────────────────────────┘  │
│                    │                              │
│              OpenAI API                           │
│         (Responses API v6)                        │
└──────────────────────────────────────────────────┘
```

| 模块 | 职责 |
|------|------|
| `src/Agent/loop.ts` | Agent 主循环：while + maxSteps + 结束条件 + 错误恢复 |
| `src/Agent/retry.ts` | 指数退避重试（429 / 5xx / 连接错误） |
| `src/Agent/session.ts` | 会话持久化（JSON 文件）+ 超长对话摘要压缩 |
| `src/Agent/trajectory.ts` | 执行轨迹格式化输出 |
| `src/tools/registry.ts` | 工具注册表：注册、schema 提取、执行分发 |
| `src/tools/todo.ts` | 5 个真实工具：add / list / complete / delete / search |
| `eval/suite.ts` | 9 条自动化评测用例 |

## 三条用户故事（Demo 脚本）

### 故事 1：第一次使用 —— 添加和查看待办

```
> 添加三条待办：写周报、健身、看书

> 列出所有待办

> 搜索"书"相关的待办
```

**预期**：Agent 依次调用 `todo_add` 三次，然后 `todo_list` 列出全部，最后 `todo_search` 精确匹配。

### 故事 2：任务全生命周期 —— 完成和删除

```
> 帮我添加待办：买牛奶、倒垃圾、浇花

> 把倒垃圾标记为已完成

> 列出所有待办

> 删除浇花
```

**预期**：Agent 完成"创建→完成→列表→删除"全链路，每一步确认结果后才继续。

### 故事 3：会话恢复 —— 关掉进程再打开

```bash
# 第一轮
bun start
> 添加待办：写学习笔记
> /exit

# 第二轮（重新启动）
bun start
> 列出所有待办
> 把"写学习笔记"标记为已完成
> /exit
```

**预期**：重启后 Agent 自动加载上一次的对话历史（通过 `assets/sessions.json`），能在之前添加的待办基础上继续操作。

## 运行评测

```bash
bun test
```

输出 9 条用例的通过/失败情况，覆盖：增删改查、多步骤组合、越界请求、空输入、运行日志完整性。

## 项目结构

```
learn-agent/
├── src/
│   ├── main.ts              # CLI 入口
│   ├── Agent/
│   │   ├── loop.ts          # Agent 主循环
│   │   ├── retry.ts         # 重试策略
│   │   ├── session.ts       # 会话持久化
│   │   └── trajectory.ts    # 轨迹可视化
│   ├── tools/
│   │   ├── index.ts         # 导出
│   │   ├── registry.ts      # 工具注册表
│   │   └── todo.ts          # 待办工具实现
│   ├── ResponsesAPI/        # API 学习 demo（L0-L4）
│   └── Homework/            # 练习代码
├── eval/
│   └── suite.ts             # 评测套件
├── assets/
│   ├── sessions.json        # 会话持久化文件
│   └── styles.css           # 课件样式
├── lessons/                 # 课件（0001-0009）
├── learning-records/        # 学习记录
├── MISSION.md               # 学习目标
├── CURRICULUM.md            # 课程大纲
└── README.md                # 本文件
```

## 技术栈

- **Runtime**: [Bun](https://bun.sh)
- **Language**: TypeScript (strict)
- **LLM SDK**: openai v6 (Responses API)
- **Schema**: Zod v4
- **模式**: Agent Loop（while + maxSteps），非框架黑盒

## License

Private learning project.
