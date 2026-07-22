import type OpenAI from 'openai';
import type {
  ResponseFunctionToolCall,
  ResponseInput,
  ResponseInputItem,
  ResponseOutputItem,
} from 'openai/resources/responses/responses.mjs';
import type { ToolRegistry } from '../tools/registry';

interface RunAgentOptions {
  maxSteps: number;
  instructions?: string;
}

interface RunAgentParams {
  client: OpenAI;
  input: string;
  registry: ToolRegistry;
  options: RunAgentOptions;
  summary?: string;
  conversation?: ResponseInputItem[];
}

interface RunAgentResult {
  finalOutput: ResponseOutputItem | null;
  outputText: string | null;
  trajectory: { step: number; output: ResponseOutputItem[] }[];
  steps: number;
  conversation: ResponseInputItem[];
}

export const runAgent = async ({
  client,
  input,
  registry,
  options,
  summary,
  conversation = [],
}: RunAgentParams): Promise<RunAgentResult> => {
  const { maxSteps, instructions } = options;
  const trajectory: { step: number; output: ResponseOutputItem[] }[] = [];
  const currentInput: ResponseInput = [];

  if (summary) {
    currentInput.push({
      role: 'developer',
      content: summary,
    });
  }

  currentInput.push(...conversation, {
    role: 'user',
    content: input,
  });

  let steps = 0;
  let finalOutput: ResponseOutputItem | null = null;
  let outputText: string | null = null;

  while (steps < maxSteps) {
    const response = await client.responses.create({
      tools: registry.getSchemas(),
      model: 'gpt-5.4-mini',
      input: currentInput,
      instructions,
    });
    const { output } = response;
    trajectory.push({ step: steps, output });
    const functionCalls = output.filter((item): item is ResponseFunctionToolCall => item.type === 'function_call');

    if (functionCalls.length === 0) {
      finalOutput = output[output.length - 1] || null;
      outputText = response.output_text || null;
      break;
    }

    currentInput.push(...(output as ResponseInputItem[]));
    const functionCallOutputs: ResponseInputItem.FunctionCallOutput[] = [];
    for (const functionCall of functionCalls) {
      const params = JSON.parse(functionCall.arguments);
      const result = await registry.execute(functionCall.name, params);
      const functionCallOutput: ResponseInputItem.FunctionCallOutput = {
        type: 'function_call_output',
        call_id: functionCall.call_id,
        output: result,
      };
      functionCallOutputs.push(functionCallOutput);
    }

    currentInput.push(...functionCallOutputs);
    steps++;
  }

  const rawConversation = currentInput.filter(item => 'role' in item && item.role !== 'developer')

  return { finalOutput, outputText, trajectory, steps, conversation: rawConversation };
};
