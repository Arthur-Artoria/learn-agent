import OpenAI from 'openai';

export const textGeneration = async (client: OpenAI) => {
  const response = await client.responses.create({
    model: "gpt-5.4-mini",
    reasoning: { effort: 'low' },
    instructions: '像海盗一样说话。',
    input: 'JavaScript中的分号是可选的吗？'
  });

  console.log(response.output_text);
};
