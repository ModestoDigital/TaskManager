import { TRPCError } from '@trpc/server';
import {
  createTaskInputSchema,
  listTasksInputSchema,
  taskIdInputSchema,
  updateTaskInputSchema,
} from '@/schemas/task';
import {
  InvalidTaskCursorError,
  TaskNotFoundError,
  TaskService,
} from '@/server/services/task-service';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';

function mapTaskError(error: unknown): never {
  if (error instanceof TaskNotFoundError) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found.' });
  }

  if (error instanceof InvalidTaskCursorError) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid task cursor.' });
  }

  throw error;
}

export function createTaskRouter(service: TaskService) {
  return createTRPCRouter({
    create: baseProcedure.input(createTaskInputSchema).mutation(({ input }) => service.create(input)),
    list: baseProcedure.input(listTasksInputSchema).query(({ input }) => {
      try {
        return service.list(input ?? { limit: 20 });
      } catch (error) {
        return mapTaskError(error);
      }
    }),
    getById: baseProcedure.input(taskIdInputSchema).query(({ input }) => {
      try {
        return service.getById(input.id);
      } catch (error) {
        return mapTaskError(error);
      }
    }),
    update: baseProcedure.input(updateTaskInputSchema).mutation(({ input }) => {
      try {
        return service.update(input);
      } catch (error) {
        return mapTaskError(error);
      }
    }),
    delete: baseProcedure.input(taskIdInputSchema).mutation(({ input }) => {
      try {
        service.delete(input.id);
        return { success: true, id: input.id };
      } catch (error) {
        return mapTaskError(error);
      }
    }),
  });
}
