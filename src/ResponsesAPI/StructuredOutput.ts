import type OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import z from 'zod';

const CalendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
})

export const structuredOutput = async (client: OpenAI) => { 
  const response = await client.responses.parse({
    model: "gpt-5.4-mini",
    input: [
      {
        role: 'system',
        content: '提取事件信息。'
      },
      {
        role: 'user',
        content: '阿尔托莉雅和她的骑士以及侍从周五要去参加一个晚宴'
      }
    ],
    text: {
      format: zodTextFormat(CalendarEvent, 'event')
    }
  })
  const event = response.output_parsed;
  console.log(event);
}