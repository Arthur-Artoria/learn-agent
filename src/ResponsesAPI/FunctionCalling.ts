import type OpenAI from 'openai';
import type {
  ResponseFunctionToolCall,
  ResponseInputItem
} from 'openai/resources/responses/responses.js';

// 1. 为模型定义一个可调用的工具列表
const tools: OpenAI.Responses.Tool[] = [
  {
    type: 'function',
    name: 'get_horoscope',
    description: '获取星座运势',
    parameters: {
      type: 'object',
      properties: {
        sign: {
          type: 'string',
          description: '像金牛座或水瓶座这样的星座名称',
        },
      },
      required: ['sign'],
      additionalProperties: false,
    },
    strict: true,
  },
];

const getHoroscope = (sign: string) => {
  return `今天${sign}座的运势是：今天你会有一个惊喜的发现，工作上会有一个重要的合作机会，财运上会有一个意外的收获，感情上会有一个美好的邂逅，健康上会有一个意外的惊喜，学业上会有一个意外的收获。`;
};

const getWeather = async (city: string) => { 
  return `今天${city}的天气是晴天，温度是20度，湿度是50%，风力是3级，空气质量是优。`;
}

export const getHoroscopeFunctionCalling = async (client: OpenAI) => {
  // 2. 创建一个响应配置，指定模型、输入和工具
  const input: ResponseInputItem[] = [{ role: 'user', content: '今天金牛座的运势如何？' }];
  const response = await client.responses.create({ model: 'gpt-5.4-mini', input, tools });

  // 3. 执行获取星座功能的工具调用
  const functionCall = response.output.filter(
    (item): item is ResponseFunctionToolCall => item.type === 'function_call' && item.name === 'get_horoscope',
  );
  const functionCallOutput = functionCall.map<ResponseInputItem.FunctionCallOutput>(item => ({
    type: 'function_call_output',
    call_id: item.call_id,
    output: getHoroscope(JSON.parse(item.arguments).sign),
  }));

  // 4. 将原始响应和工具调用输出合并到输入中
  input.push(...functionCall);
  input.push(...functionCallOutput);
  console.log('最终的输入：');
  console.log(JSON.stringify(input, null, 2));

  // 5. 创建最终响应
  const finalResponse = await client.responses.create({
    model: 'gpt-5.4-mini',
    input,
    tools,
    instructions: '仅用工具生成的占星术来回应。',
  });
  console.log('最终的响应：');
  console.log(finalResponse.output_text);
};


const getWeatherTools: OpenAI.Responses.Tool[] = [
  {
    type: 'function',
    name: 'getWeather',
    description: '获取城市的天气情况',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: '城市的名称，如北京、上海、广州、深圳等',
        }
      },
      required: ['city'],
      additionalProperties: false,
    }
  }
]

export const getWeatherFunctionCalling = async (client: OpenAI) => { 
  const input: ResponseInputItem[] = [{ role: 'user', content: '今天广州的天气如何？' }];
  const finalTooCalls: ResponseInputItem.FunctionCallOutput[] = []
  const stream = await client.responses.create({ model: 'gpt-5.4-mini', input, tools: getWeatherTools, stream: true, store: true });

  let responseId = ''

  for await (const event of stream) {
    // console.log(event);

    if (event.type === 'response.created') {
      responseId = event.response.id
    }

    if (event.type === 'response.output_item.done') {
      const outputItem = event.item
      if (outputItem.type === 'function_call' && outputItem.name === 'getWeather') { 
        const output = await getWeather(JSON.parse(outputItem.arguments).city)
        finalTooCalls.push({
          type: 'function_call_output',
          output,
          call_id: outputItem.call_id,
        })
      }
    }
  }

  const finalResponse = await client.responses.create({
    model: 'gpt-5.4-mini',
    input: finalTooCalls,
    stream: true,
    store: true,
    previous_response_id: responseId,
    instructions: '仅用工具生成的天气情况来回应。',
  })

  for await (const event of finalResponse) {
    if (event.type === 'response.completed') {
      console.log(event.response.output_text);
    }
  }
}