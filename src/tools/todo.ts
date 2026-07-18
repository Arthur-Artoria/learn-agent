import fs from 'node:fs/promises';
import path from 'node:path';
import type { Tool } from './registry';

const DB_PATH = path.resolve(import.meta.dirname ?? '.', 'todos.json');

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

async function readDB(): Promise<Todo[]> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeDB(todos: Todo[]): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(todos, null, 2), 'utf-8');
}

function generateId(): string {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const todoAdd: Tool = {
  schema: {
    type: 'function',
    name: 'todo_add',
    description: '添加一个新的待办事项',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '待办标题' },
        description: { type: 'string', description: '待办详细描述（可选）' },
      },
      required: ['title'],
      additionalProperties: false,
    },
  },
  execute: async (args) => {
    const title = String(args.title ?? '');
    const description = args.description ? String(args.description) : undefined;

    if (!title.trim()) {
      return 'Error: title is required and cannot be empty';
    }

    const todo: Todo = {
      id: generateId(),
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const todos = await readDB();
    todos.push(todo);
    await writeDB(todos);

    return `已添加待办: [${todo.id}] ${todo.title}`;
  },
};

const todoList: Tool = {
  schema: {
    type: 'function',
    name: 'todo_list',
    description: '列出待办事项，可按状态筛选（pending 或 completed），不传则返回全部',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'completed'],
          description: '筛选状态（可选）',
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  execute: async (args) => {
    const status = args.status ? String(args.status) : undefined;
    const todos = await readDB();

    const filtered = status
      ? todos.filter((t) => t.status === status)
      : todos;

    if (filtered.length === 0) {
      return status
        ? `没有${status === 'pending' ? '待完成' : '已完成'}的待办事项。`
        : '当前没有任何待办事项。';
    }

    const lines = filtered.map((t) => {
      const check = t.status === 'completed' ? '✅' : '⬜';
      return `${check} [${t.id}] ${t.title}${t.description ? ' — ' + t.description : ''}`;
    });

    return lines.join('\n');
  },
};

const todoComplete: Tool = {
  schema: {
    type: 'function',
    name: 'todo_complete',
    description: '将指定 id 的待办事项标记为已完成',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '待办事项的 id' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  execute: async (args) => {
    const id = String(args.id ?? '');
    const todos = await readDB();
    const todo = todos.find((t) => t.id === id);

    if (!todo) {
      return `Error: 未找到 id 为 "${id}" 的待办事项`;
    }

    if (todo.status === 'completed') {
      return `待办 [${id}] "${todo.title}" 已经是已完成状态。`;
    }

    todo.status = 'completed';
    await writeDB(todos);

    return `已标记完成: [${id}] ${todo.title}`;
  },
};

const todoDelete: Tool = {
  schema: {
    type: 'function',
    name: 'todo_delete',
    description: '删除指定 id 的待办事项',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '待办事项的 id' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  execute: async (args) => {
    const id = String(args.id ?? '');
    const todos = await readDB();
    const index = todos.findIndex((t) => t.id === id);

    if (index === -1) {
      return `Error: 未找到 id 为 "${id}" 的待办事项`;
    }

    const deleted = todos.splice(index, 1)[0];
    await writeDB(todos);

    return `已删除待办: [${id}] ${deleted!.title}`;
  },
};

const todoSearch: Tool = {
  schema: {
    type: 'function',
    name: 'todo_search',
    description: '搜索待办事项，可按标题或描述模糊搜索',
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜索关键词' },
      },
      required: ['query'],
      additionalProperties: false,
    }
  },

  execute: async (args) => { 
    const query = String(args.query ?? '');
    const todos = await readDB();
    const filtered = todos.filter((t) => t.title.includes(query) || t.description?.includes(query));
    if (filtered.length === 0) {
      return `Error: 未找到与 "${query}" 相关的待办事项。`;
    }
    const lines = filtered.map((t) => {
      const check = t.status === 'completed' ? '✅' : '⬜';
      return `${check} [${t.id}] ${t.title}${t.description ? ' — ' + t.description : ''}`;
    });
    return lines.join('\n');
  }
}

export const todoTools: Tool[] = [todoAdd, todoList, todoComplete, todoDelete, todoSearch];
