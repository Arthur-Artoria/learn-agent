import { runAgent } from './Agent/loop';
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
  });

  const registry = new ToolRegistry();
  for (const tool of todoTools) {
    registry.register(tool);
  }

  const instructions = `你是一个任务管理助手。对于任何涉及 2 个及以上操作的请求，你必须遵循以下流程：

1. **分析**：先理解用户意图，用文字简要说明需要哪些步骤
2. **执行**：按步骤依次调用工具，每步完成后确认结果再继续
3. **总结**：最后汇总做了什么、结果如何、是否有遗留问题

如果某一步工具返回 Error，说明失败原因并尝试替代方案。不要直接放弃。`;

  const result = await runAgent({
    client,
    input: '我下周有三个重要事项：周一交周报、周三下午牙医预约、周五前完成项目演示。帮我规划一下，并添加到待办列表。',
    registry,
    options: { maxSteps: 10, instructions },
  });

  console.log(formatTrajectory(result.trajectory));
  console.log('\n=== 最终回答 ===');
  console.log(result.outputText);
  console.log(`\n共 ${result.steps} 步`);
}

await setup();
