import type { Task } from '@/types/task';
import type { TaskRepository } from './task-repository';

function cloneTask(task: Task): Task {
  return { ...task };
}

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  create(task: Task): Task {
    const storedTask = cloneTask(task);
    this.tasks.set(storedTask.id, storedTask);
    return cloneTask(storedTask);
  }

  findById(id: string): Task | undefined {
    const task = this.tasks.get(id);
    return task ? cloneTask(task) : undefined;
  }

  update(task: Task): Task {
    const storedTask = cloneTask(task);
    this.tasks.set(storedTask.id, storedTask);
    return cloneTask(storedTask);
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  list(): Task[] {
    return Array.from(this.tasks.values(), cloneTask);
  }
}
