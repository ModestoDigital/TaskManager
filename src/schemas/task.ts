import { z } from 'zod';

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title cannot be empty or contain only whitespace.');

export const createTaskInputSchema = z.object({
  titulo: titleSchema,
  descricao: z.string().optional(),
});

export const updateTaskInputSchema = z
  .object({
    id: z.uuid(),
    titulo: titleSchema.optional(),
    descricao: z.string().nullable().optional(),
  })
  .refine((input) => input.titulo !== undefined || input.descricao !== undefined, {
    message: 'At least one editable field must be provided.',
  });

export const taskIdInputSchema = z.object({
  id: z.uuid(),
});

export const listTasksInputSchema = z
  .object({
    cursor: z.string().min(1).optional(),
    limit: z.number().int().min(1).max(50).default(20),
  })
  .optional();

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type ListTasksInput = {
  cursor?: string;
  limit: number;
};
