import type OpenAI from 'openai';

export interface Tool {
  schema: OpenAI.Responses.Tool;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    const name = 'name' in tool.schema ? tool.schema.name : 'unknown';
    this.tools.set(name, tool);
  }

  getSchemas(): OpenAI.Responses.Tool[] {
    return Array.from(this.tools.values()).map((t) => t.schema);
  }

  async execute(name: string, args: Record<string, unknown>): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      return `Error: unknown tool "${name}"`;
    }
    try {
      return await tool.execute(args);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `Error: tool "${name}" failed — ${message}`;
    }
  }
}
