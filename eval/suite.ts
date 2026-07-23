import { runAgent } from '../src/Agent/loop';
import type { RunAgentResult } from '../src/Agent/loop';
import { ToolRegistry } from '../src/tools/registry';
import { todoTools } from '../src/tools/todo';
import OpenAI from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';

const TODO_DB_PATH = path.resolve(import.meta.dirname ?? '.', '../src/tools/todos.json');

interface TestCase {
  name: string;
  input: string;
  assertions: ((result: RunAgentResult) => boolean)[];
}

interface TestResult {
  name: string;
  passed: boolean;
  failures: number;
}

async function resetTodos(): Promise<void> {
  await fs.writeFile(TODO_DB_PATH, '[]', 'utf-8');
}

function assert(condition: boolean, label: string): boolean {
  if (!condition) {
    console.log(`  ✗ ${label}`);
    return false;
  }
  return true;
}

function countToolCalls(result: RunAgentResult, toolName: string): number {
  let count = 0;
  for (const step of result.trajectory) {
    for (const item of step.output) {
      if (item.type === 'function_call' && item.name === toolName) {
        count++;
      }
    }
  }
  return count;
}

const cases: TestCase[] = [
  {
    name: 'add_single_todo',
    input: '帮我添加一个待办：买菜',
    assertions: [
      (r) => {
        const ok = r.outputText !== null && r.outputText.length > 0;
        return assert(ok, 'outputText 不为空');
      },
      (r) => assert(countToolCalls(r, 'todo_add') >= 1, '调用了至少 1 次 todo_add'),
      (r) => assert(r.runLog.outcome === 'success', 'outcome 为 success'),
    ],
  },
  {
    name: 'add_multiple_todos',
    input: '帮我添加三条待办：写周报、健身、看书',
    assertions: [
      (r) => assert(countToolCalls(r, 'todo_add') >= 1, '调用了 todo_add'),
      (r) => assert(r.outputText !== null && r.outputText.length > 0, 'outputText 不为空'),
      (r) => assert(r.steps >= 1, '至少执行了 1 步'),
    ],
  },
  {
    name: 'list_empty_todos',
    input: '列出所有待办',
    assertions: [
      (r) => assert(countToolCalls(r, 'todo_list') >= 1, '调用了至少 1 次 todo_list'),
      (r) => assert(r.outputText !== null, '不抛异常，有文本输出'),
      (r) => assert(r.runLog.outcome === 'success', 'outcome 为 success'),
    ],
  },
  {
    name: 'list_after_add',
    input: '帮我列出所有待办事项',
    assertions: [
      (r) => assert(countToolCalls(r, 'todo_list') >= 1, '调用了至少 1 次 todo_list'),
      (r) => assert(r.outputText !== null && r.outputText.length > 0, 'outputText 不为空'),
    ],
  },
  {
    name: 'complete_todo',
    input: '帮我添加一条待办：跑步。然后把"跑步"标记为完成。',
    assertions: [
      (r) => assert(countToolCalls(r, 'todo_add') >= 1, '调用了 todo_add'),
      (r) => assert(countToolCalls(r, 'todo_complete') >= 1, '调用了 todo_complete'),
      (r) => assert(r.runLog.outcome === 'success', 'outcome 为 success'),
    ],
  },
  {
    name: 'delete_todo',
    input: '帮我添加一个待办：看牙医，然后删除它。',
    assertions: [
      (r) => assert(countToolCalls(r, 'todo_add') >= 1, '调用了 todo_add'),
      (r) => assert(countToolCalls(r, 'todo_delete') >= 1, '调用了 todo_delete'),
      (r) => assert(r.runLog.outcome === 'success', 'outcome 为 success'),
    ],
  },
  {
    name: 'out_of_scope',
    input: '帮我订一张明天去北京的机票',
    assertions: [
      (r) => {
        const ok = r.outputText !== null && r.outputText.length > 0;
        return assert(ok, '输出不为空（不应崩溃）');
      },
      (r) => {
        const isGraceful = !r.outputText?.includes('Error') || r.outputText.length > 50;
        return assert(isGraceful, '合理处理超出能力的请求');
      },
    ],
  },
  {
    name: 'empty_input',
    input: '',
    assertions: [
      (r) => assert(r.outputText !== null && r.outputText.length > 0, '不抛异常，有文本输出'),
      (r) => assert(r.runLog.outcome !== 'error', 'outcome 不为 error'),
    ],
  },
  {
    name: 'runlog_has_timeline',
    input: '添加待办：测试待办',
    assertions: [
      (r) => {
        const hasTimeline = r.runLog.timeline.length > 0;
        return assert(hasTimeline, 'runLog.timeline 有记录');
      },
      (r) => {
        const hasRunId = r.runLog.runId.length > 0;
        return assert(hasRunId, 'runLog.runId 不为空');
      },
      (r) => {
        const allHaveTool = r.runLog.timeline.every((t) => t.tool.length > 0);
        return assert(allHaveTool, '每条 timeline 记录都有 tool 名');
      },
    ],
  },
];

async function runEval(): Promise<void> {
  const client = new OpenAI({
    baseURL: process.env.GODEX_BASE_URL,
  });

  const registry = new ToolRegistry();
  for (const tool of todoTools) {
    registry.register(tool);
  }

  const instructions = `你是一个任务管理助手。对于涉及操作的请求，遵循以下流程：
1. **分析**：理解用户意图
2. **执行**：调用工具
3. **总结**：汇总结果
如果工具返回 Error，说明原因并尝试替代方案。如果你无法处理用户的请求（比如订机票），礼貌告知用户。`;

  const results: TestResult[] = [];

  for (const testCase of cases) {
    await resetTodos();

    const result = await runAgent({
      client,
      input: testCase.input,
      registry,
      options: { maxSteps: 10, instructions },
    });

    const failures = testCase.assertions.filter((fn) => !fn(result));
    const passed = failures.length === 0;

    results.push({ name: testCase.name, passed, failures: failures.length });
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log('\n═══════════════════════════════════════');
  console.log('📊 评测结果汇总');
  console.log('═══════════════════════════════════════');
  console.log(`  通过: ${passed}/${total}  |  失败: ${failed}/${total}`);
  console.log('───────────────────────────────────────');

  for (const r of results) {
    const icon = r.passed ? '✅' : '❌';
    const detail = r.passed ? '' : ` (${r.failures} 条断言失败)`;
    console.log(`  ${icon} ${r.name}${detail}`);
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

await runEval();
