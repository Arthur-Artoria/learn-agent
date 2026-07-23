import type OpenAI from 'openai';
import type {
  ResponseFunctionToolCall,
  ResponseInput,
  ResponseInputItem,
  ResponseOutputItem,
} from 'openai/resources/responses/responses.mjs';
import type { ToolRegistry } from '../tools/registry';
import { retry } from './retry';

interface RunAgentOptions {
  maxSteps: number;
  instructions?: string;
}

export interface RunLog {
  runId: string;
  outcome: 'success' | 'max_steps' | 'timeout' | 'error';
  timeline: {
    step: number;
    tool: string;
    params: Record<string, unknown>;
    durationMs: number;
    status: 'ok' | 'error';
  }[];
}

interface RunAgentParams {
  client: OpenAI;
  input: string;
  registry: ToolRegistry;
  options: RunAgentOptions;
  summary?: string;
  conversation?: ResponseInputItem[];
  timeoutMs?: number;
}

export interface RunAgentResult {
  finalOutput: ResponseOutputItem | null;
  outputText: string | null;
  trajectory: { step: number; output: ResponseOutputItem[] }[];
  steps: number;
  conversation: ResponseInputItem[];
  runLog: RunLog;
}

async function callModel(
  client: OpenAI,
  input: ResponseInput,
  registry: ToolRegistry,
  instructions: string | undefined,
  timeoutMs: number,
) {
  try {
    return await retry(
      () =>
        client.responses.create(
          {
            tools: registry.getSchemas(),
            model: 'gpt-5.6-sol',
            input,
            instructions,
          },
          { timeout: timeoutMs },
        ),
      { maxRetries: 3 },
    )();
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function executeTool(
  functionCall: ResponseFunctionToolCall,
  registry: ToolRegistry,
  runLog: RunLog,
  step: number,
): Promise<ResponseInputItem.FunctionCallOutput> {
  const startedAt = Date.now();
  const params = JSON.parse(functionCall.arguments);
  let result: string;

  try {
    result = await registry.execute(functionCall.name, params);
  } catch (err) {
    result = `Error: ${err instanceof Error ? err.message : String(err)}`;
  }

  runLog.timeline.push({
    step,
    tool: functionCall.name,
    params,
    durationMs: Date.now() - startedAt,
    status: result.startsWith('Error') ? 'error' : 'ok',
  });

  return {
    type: 'function_call_output',
    call_id: functionCall.call_id,
    output: result,
  };
}

export const runAgent = async ({
  client,
  input,
  registry,
  options,
  summary,
  conversation = [],
  timeoutMs = 5000,
}: RunAgentParams): Promise<RunAgentResult> => {
  const { maxSteps, instructions } = options;
  const trajectory: { step: number; output: ResponseOutputItem[] }[] = [];
  const runLog: RunLog = {
    runId: crypto.randomUUID(),
    outcome: 'success',
    timeline: [],
  };
  const currentInput: ResponseInput = [];

  if (summary) {
    currentInput.push({ role: 'developer', content: summary });
  }
  currentInput.push(...conversation, { role: 'user', content: input });

  let steps = 1;
  let finalOutput: ResponseOutputItem | null = null;
  let outputText: string | null = null;

  while (steps < maxSteps) {
    const response = await callModel(client, currentInput, registry, instructions, timeoutMs);
    if (!response) {
      runLog.outcome = 'error';
      break;
    }

    const { output } = response;
    trajectory.push({ step: steps, output });

    const functionCalls = output.filter(
      (item): item is ResponseFunctionToolCall => item.type === 'function_call',
    );

    if (functionCalls.length === 0) {
      finalOutput = output[output.length - 1] || null;
      outputText = response.output_text || null;
      break;
    }

    currentInput.push(...(output as ResponseInputItem[]));

    const functionCallOutputs: ResponseInputItem.FunctionCallOutput[] = [];
    for (const fc of functionCalls) {
      functionCallOutputs.push(await executeTool(fc, registry, runLog, steps));
    }
    currentInput.push(...functionCallOutputs);

    steps++;
  }

  if (runLog.outcome !== 'error' && steps >= maxSteps) {
    runLog.outcome = 'max_steps';
  }

  const rawConversation = currentInput.filter(
    (item) => 'role' in item && item.role !== 'developer',
  );

  return { finalOutput, outputText, trajectory, steps, conversation: rawConversation, runLog };
};
