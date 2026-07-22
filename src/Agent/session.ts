import type OpenAI from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { ResponseInputItem } from 'openai/resources/responses/responses.mjs';

interface SessionStore {
  summary: string;
  history: ResponseInputItem[];
}

export interface SessionData {
  summary: string;
  history: ResponseInputItem[];
}

export class SessionManager {
  private static DB_PATH = path.resolve(import.meta.dirname ?? '.', '../../assets/sessions.json');

  private summary: string = '';
  private history: ResponseInputItem[] = [];

  constructor(
    private readonly client: OpenAI,
    private readonly maxItems: number = 40,
  ) {}

  async load(): Promise<SessionData> {
    try {
      const data = await fs.readFile(SessionManager.DB_PATH, 'utf-8');
      const store: SessionStore = JSON.parse(data);
      this.summary = store.summary || '';
      this.history = store.history || [];
    } catch {
      this.summary = '';
      this.history = [];
    }
    return { summary: this.summary, history: [...this.history] };
  }

  async save(history: ResponseInputItem[]): Promise<void> {
    this.history = history;

    if (this.history.length > this.maxItems) {
      await this.compress();
    }

    const store: SessionStore = {
      summary: this.summary,
      history: this.history,
    };
    await fs.writeFile(SessionManager.DB_PATH, JSON.stringify(store, null, 2), 'utf-8');
  }

  private async compress(): Promise<void> {
    const overflow = this.history.length - this.maxItems;
    const oldItems = this.history.splice(0, overflow);

    const response = await this.client.responses.create({
      model: 'gpt-5.4-mini',
      input: [
        ...oldItems,
        {
          role: 'user',
          content:
            '请用一段简短的中文摘要总结以上对话的关键信息，包括：用户是谁、讨论了什么主题、做了什么操作、有什么重要结论。只输出摘要本身，不要加前缀或说明。',
        },
      ],
    });

    const newSummary = response.output_text || '';
    this.summary = this.summary ? `${this.summary}\n\n---\n\n${newSummary}` : newSummary;
  }
}
