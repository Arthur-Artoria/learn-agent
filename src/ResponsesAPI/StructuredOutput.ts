import type OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import z from 'zod';

const CalendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

const Step = z.object({
  explanation: z.string(),
  output: z.string(),
});

const MathReasoning = z.object({
  steps: z.array(Step),
  final_answer: z.string(),
});

const EntitiesSchema = z.object({
  attributes: z.array(z.string()),
  colors: z.array(z.string()),
  animals: z.array(z.string()),
});

export const structuredOutput = async (client: OpenAI) => {
  const response = await client.responses.parse({
    model: 'gpt-5.4-mini',
    input: [
      {
        role: 'system',
        content: '提取事件信息。',
      },
      {
        role: 'user',
        content: '阿尔托莉雅和她的骑士以及侍从周五要去参加一个晚宴',
      },
    ],
    text: {
      format: zodTextFormat(CalendarEvent, 'event'),
    },
  });
  const event = response.output_parsed;
  console.log(event);
};

export const getMathReasoning = async (client: OpenAI) => {
  const response = await client.responses.parse({
    model: 'gpt-5.4-mini',
    input: [
      { role: 'system', content: 'You are a helpful math tutor. Guide the user through the solution step by step.' },
      { role: 'user', content: 'how can I solve 8x + 7 = -23' },
    ],
    text: {
      format: zodTextFormat(MathReasoning, 'math_reasoning'),
    },
  });

  const messages = response.output.find(item => item.type === 'message');
  messages?.content.find(item => {
    if (item.type === 'refusal') {
      console.log(item.refusal);
      return;
    }

    if (!item.parsed) {
      throw new Error('Failed to parse response');
    }

    console.log(item.parsed);
  });
};

export const getMathAnswer = async (client: OpenAI) => {
  const response = await client.responses.parse({
    model: 'gpt-5.4-mini',
    input: [
      {
        role: 'system',
        content: '你是一个数学老师，请根据以下步骤计算出答案。',
      },
      {
        role: 'user',
        content: '我该如何解方程 8x + 7 = -23？',
      },
    ],
    text: {
      format: zodTextFormat(MathReasoning, 'math_reasoning'),
    },
  });
  const mathReasoning = response.output_parsed;
  console.log(mathReasoning);
};

export const streamStructuredOutput = async (client: OpenAI) => {
  const stream = client.responses
    .stream({
      model: 'gpt-5.4-mini',
      input: [{ role: 'user', content: '今天广州的天气如何？' }],
      text: {
        format: zodTextFormat(EntitiesSchema, 'entities'),
      },
    })
    .on('response.refusal.delta', event => {
      process.stdout.write(event.delta);
    })
    .on('response.output_text.delta', event => {
      process.stdout.write(event.delta);
    })
    .on('response.output_text.done', () => {
      process.stdout.write('\n');
    })
    .on('error', event => {
      console.error(event);
    });
  
  const result = await stream.finalResponse()
  console.log(result);
};
