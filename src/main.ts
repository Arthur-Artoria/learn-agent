import { runAgent } from './Agent/loop';
import { getCustomToolCalling, getHoroscopeFunctionCalling, getWeatherFunctionCalling, tools } from './ResponsesAPI/FunctionCalling';
import { getMathAnswer, getMathReasoning, streamStructuredOutput, structuredOutput } from './ResponsesAPI/StructuredOutput';
import { textGeneration } from './ResponsesAPI/TextGeneration';
import OpenAI from 'openai';

const setup = async () => { 
  const client = new OpenAI({
    baseURL: process.env.GODEX_BASE_URL,
  });

  // await textGeneration(client);
  // await structuredOutput(client);
  // await getMathReasoning(client);
  // await getMathAnswer(client);
  // await streamStructuredOutput(client);
  // await getHoroscopeFunctionCalling(client);
  // await getWeatherFunctionCalling(client);
  // await getCustomToolCalling(client);
  const result = await runAgent({ client, input: '我是处女座，住在广州，如果今天的运势和天气都不错，我想出去散散步', tools, options: { maxSteps: 10 } });
  console.log(result);
}

await setup();
