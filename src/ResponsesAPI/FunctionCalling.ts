import type OpenAI from 'openai'

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
          description: '像金牛座或水瓶座这样的星座名称'
        }
      },
      required: ['sign'],
      additionalProperties: false,
    },
    strict: true,
  }
]

const getHoroscope = async (sign: string) => { 
  return `今天${sign}座的运势是：今天你会有一个惊喜的发现，工作上会有一个重要的合作机会，财运上会有一个意外的收获，感情上会有一个美好的邂逅，健康上会有一个意外的惊喜，学业上会有一个意外的收获。`
}

const input: OpenAI.Responses.ResponseInput = [
  { role: 'user', content: '今天金牛座的运势如何？' }
]

// 2. 创建一个响应配置，指定模型、输入和工具
export const getHoroscopeFunctionCalling = async (client: OpenAI) => { 
  const response = await client.responses.create({ model: 'gpt-5.4-mini', input, tools })
}