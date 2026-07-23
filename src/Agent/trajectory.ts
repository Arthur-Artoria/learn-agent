import type { ResponseOutputItem } from 'openai/resources/responses/responses.mjs';

export interface StepRecord {
  step: number;
  output: ResponseOutputItem[];
}

function truncate(text: string, maxLen = 80): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

function formatFunctionCall(item: Record<string, unknown>): string {
  const name = String(item.name ?? 'unknown');
  const args = String(item.arguments ?? '{}');
  return `🔧 ${name}(${truncate(args)})`;
}

function formatFunctionCallOutput(item: Record<string, unknown>): string {
  const output = String(item.output ?? '');
  const isError = output.startsWith('Error');
  const prefix = isError ? '  ❌' : '  →';
  return `${prefix} ${truncate(output)}`;
}

function formatMessage(item: Record<string, unknown>): string {
  const content = item.content;
  if (Array.isArray(content)) {
    return content
      .map((c: Record<string, unknown>) => {
        if (c.type === 'output_text') return `💬 ${truncate(String(c.text ?? ''))}`;
        return `💬 [${c.type}]`;
      })
      .join('\n');
  }
  if (typeof content === 'string') return `💬 ${truncate(content)}`;
  return `💬 [message]`;
}

export function formatTrajectory(trajectory: StepRecord[]): string {
  const lines: string[] = [];
  lines.push('═'.repeat(60));
  lines.push('📋 Agent 执行轨迹');
  lines.push('═'.repeat(60));

  for (const step of trajectory) {
    lines.push(`\n── Step ${step.step} ──`);

    for (const item of step.output) {
      const record = item as unknown as Record<string, unknown>;

      switch (item.type) {
        case 'function_call':
          lines.push(formatFunctionCall(record));
          break;
        case 'function_call_output':
          lines.push(formatFunctionCallOutput(record));
          break;
        case 'message':
          lines.push(formatMessage(record));
          break;
        default:
          lines.push(`  [${item.type}]`);
      }
    }
  }

  lines.push(`\n${'═'.repeat(60)}`);
  return lines.join('\n');
}
