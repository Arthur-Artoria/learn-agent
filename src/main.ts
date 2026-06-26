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
  await streamStructuredOutput(client);
}

await setup();
