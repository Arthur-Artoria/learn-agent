import OpenAI from 'openai';
import { runAgent } from './Agent/loop';
import type { SessionData } from './Agent/session';
import { SessionManager } from './Agent/session';
import { formatTrajectory } from './Agent/trajectory';
import { ToolRegistry } from './tools/registry';
import { todoTools } from './tools/todo';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process'


const setup = async () => {
  const client = new OpenAI({
    baseURL: process.env.CHIYICN_BASE_URL,
    apiKey: process.env.CHIYICN_API_KEY,
  });

  console.log(process.env.CHIYICN_BASE_URL, process.env.CHIYICN_API_KEY);

  const registry = new ToolRegistry();
  for (const tool of todoTools) {
    registry.register(tool);
  }

  const sessionManager = new SessionManager(client);

  const instructions = `你是一个任务管理助手。对于任何涉及 2 个及以上操作的请求，你必须遵循以下流程：

1. **分析**：先理解用户意图，用文字简要说明需要哪些步骤
2. **执行**：按步骤依次调用工具，每步完成后确认结果再继续
3. **总结**：最后汇总做了什么、结果如何、是否有遗留问题

如果某一步工具返回 Error，说明失败原因并尝试替代方案。不要直接放弃。

**不要随意创建/删除/更改待办**：除非用户明确要求，不要以自己的判断创建/删除/更改任何待办
`;

  const run = async (input: string) => {
    const { summary, history }: SessionData = await sessionManager.load();
    const result = await runAgent({
      client,
      input,
      registry,
      options: { maxSteps: 10, instructions },
      summary,
      conversation: history,
    });

    console.log(formatTrajectory(result.trajectory));
    console.log('\n=== 最终回答 ===');
    console.log(result.outputText);
    console.log(`\n共 ${result.steps} 步`);

    await sessionManager.save(result.conversation);
    console.log('\n---\n');
  };

  const rl = readline.createInterface({ input, output });

  console.log('请输入你的请求：');
  console.log('输入 "Ctrl+C" 两次退出');
  for await (const line of rl) {
    await run(line);
  }
};

await setup();
