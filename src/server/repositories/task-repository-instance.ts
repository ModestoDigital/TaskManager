import { InMemoryTaskRepository } from './in-memory-task-repository';

type GlobalWithTaskRepository = typeof globalThis & {
  taskRepository?: InMemoryTaskRepository;
};

const globalForTaskRepository = globalThis as GlobalWithTaskRepository;

export const taskRepository =
  globalForTaskRepository.taskRepository ?? new InMemoryTaskRepository();

if (process.env.NODE_ENV !== 'production') {
  globalForTaskRepository.taskRepository = taskRepository;
}
