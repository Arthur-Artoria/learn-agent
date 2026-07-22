import { runAgent } from './Agent/loop';
import { SessionManager } from './Agent/session';
import type { SessionData } from './Agent/session';
import { formatTrajectory } from './Agent/trajectory';
import { getCustomToolCalling, getHoroscopeFunctionCalling, getWeatherFunctionCalling } from './ResponsesAPI/FunctionCalling';
import { getMathAnswer, getMathReasoning, streamStructuredOutput, structuredOutput } from './ResponsesAPI/StructuredOutput';
import { textGeneration } from './ResponsesAPI/TextGeneration';
import { ToolRegistry } from './tools/registry';
import { todoTools } from './tools/todo';
import OpenAI from 'openai';

const setup = async () => {
  const client = new OpenAI({
    baseURL: process.env.GODEX_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const registry = new ToolRegistry();
  for (const tool of todoTools) {
    registry.register(tool);
  }

  const sessionManager = new SessionManager(client);

  const instructions = `你是一个任务管理助手。对于任何涉及 2 个及以上操作的请求，你必须遵循以下流程：

1. **分析**：先理解用户意图，用文字简要说明需要哪些步骤
2. **执行**：按步骤依次调用工具，每步完成后确认结果再继续
3. **总结**：最后汇总做了什么、结果如何、是否有遗留问题

如果某一步工具返回 Error，说明失败原因并尝试替代方案。不要直接放弃。`;

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

  // 第 1 轮：添加两条待办
  await run('帮我添加两条待办：买牛奶、写周报');

  // 第 2 轮：追问（验证记住了上一轮）
  await run('我刚才加了什么待办？');

  // 第 3 轮：再添加一条
  await run('再加一条：周三下午去看牙医');

  // 第 4 轮：列出全部待办
  await run('帮我列出所有待办事项');
};

await setup();
