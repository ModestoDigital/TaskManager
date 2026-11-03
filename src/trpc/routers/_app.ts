import { taskRepository } from '@/server/repositories/task-repository-instance';
import { TaskService } from '@/server/services/task-service';
import { createTRPCRouter } from '@/trpc/init';
import { createTaskRouter } from './task';

export const appRouter = createTRPCRouter({
  task: createTaskRouter(new TaskService(taskRepository)),
});

export type AppRouter = typeof appRouter;
