import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from '@/schemas/task';
import type { Task, TaskCursor, TaskPage } from '@/types/task';
import type { TaskRepository } from '@/server/repositories/task-repository';

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Task ${id} was not found.`);
    this.name = 'TaskNotFoundError';
  }
}

export class InvalidTaskCursorError extends Error {
  constructor() {
    super('The task cursor is invalid.');
    this.name = 'InvalidTaskCursorError';
  }
}

type TaskServiceDependencies = {
  now?: () => Date;
  generateId?: () => string;
};

function compareTasksDescending(left: TaskCursor, right: TaskCursor): number {
  return (
    right.dataCriacao.localeCompare(left.dataCriacao) || right.id.localeCompare(left.id)
  );
}

function encodeCursor(cursor: TaskCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function decodeCursor(cursor: string): TaskCursor {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('id' in parsed) ||
      !('dataCriacao' in parsed) ||
      typeof parsed.id !== 'string' ||
      typeof parsed.dataCriacao !== 'string' ||
      Number.isNaN(Date.parse(parsed.dataCriacao))
    ) {
      throw new InvalidTaskCursorError();
    }

    return { id: parsed.id, dataCriacao: parsed.dataCriacao };
  } catch {
    throw new InvalidTaskCursorError();
  }
}

export class TaskService {
  private readonly now: () => Date;
  private readonly generateId: () => string;

  constructor(
    private readonly repository: TaskRepository,
    dependencies: TaskServiceDependencies = {},
  ) {
    this.now = dependencies.now ?? (() => new Date());
    this.generateId = dependencies.generateId ?? crypto.randomUUID;
  }

  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: this.generateId(),
      titulo: input.titulo,
      ...(input.descricao === undefined ? {} : { descricao: input.descricao }),
      dataCriacao: this.now().toISOString(),
    };

    return this.repository.create(task);
  }

  list(input: ListTasksInput): TaskPage {
    const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
    const sortedTasks = this.repository.list().sort(compareTasksDescending);
    const remainingTasks = cursor
      ? sortedTasks.filter((task) => compareTasksDescending(task, cursor) > 0)
      : sortedTasks;
    const pageWithPossibleNextItem = remainingTasks.slice(0, input.limit + 1);
    const hasNextPage = pageWithPossibleNextItem.length > input.limit;
    const items = hasNextPage
      ? pageWithPossibleNextItem.slice(0, input.limit)
      : pageWithPossibleNextItem;
    const lastTask = items.at(-1);

    return {
      items,
      ...(hasNextPage && lastTask ? { nextCursor: encodeCursor(lastTask) } : {}),
    };
  }

  getById(id: string): Task {
    const task = this.repository.findById(id);

    if (!task) {
      throw new TaskNotFoundError(id);
    }

    return task;
  }

  update(input: UpdateTaskInput): Task {
    const existingTask = this.getById(input.id);
    const updatedTask: Task = {
      ...existingTask,
      ...(input.titulo === undefined ? {} : { titulo: input.titulo }),
      ...(input.descricao === undefined
        ? {}
        : input.descricao === null
          ? { descricao: undefined }
          : { descricao: input.descricao }),
    };

    return this.repository.update(updatedTask);
  }

  delete(id: string): void {
    this.getById(id);
    this.repository.delete(id);
  }
}
