'use client';

import { useQuery } from '@tanstack/react-query';
import { TaskForm } from './task-form';
import { useTRPC } from '@/trpc/client';

export function TaskEditForm({ id }: { id: string }) {
  const trpc = useTRPC();
  const taskQuery = useQuery(trpc.task.getById.queryOptions({ id }));

  if (taskQuery.isLoading) {
    return <p role="status">Loading task…</p>;
  }

  if (taskQuery.error) {
    return <p role="alert">Task not found.</p>;
  }

  return taskQuery.data ? <TaskForm task={taskQuery.data} /> : null;
}
