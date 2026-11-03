import type { Task } from '@/types/task';

export interface TaskRepository {
  create(task: Task): Task;
  findById(id: string): Task | undefined;
  update(task: Task): Task;
  delete(id: string): boolean;
  list(): Task[];
}
