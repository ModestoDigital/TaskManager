'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useTRPC } from '@/trpc/client';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

export function TaskList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const taskList = useQuery(trpc.task.list.queryOptions({ limit: 20 }));
  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    }),
  );

  if (taskList.isLoading) {
    return <p role="status">Loading tasks…</p>;
  }

  if (taskList.error) {
    return <p role="alert">{taskList.error.message}</p>;
  }

  const tasks = taskList.data?.items ?? [];

  return (
    <section aria-labelledby="task-list-title">
      <div>
        <h1 id="task-list-title">Tasks</h1>
        <Link href="/tasks/new">Create task</Link>
      </div>
      {deleteTask.error ? <p role="alert">{deleteTask.error.message}</p> : null}
      {tasks.length === 0 ? (
        <p>No tasks yet. Create your first task.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <article>
                <h2>{task.titulo}</h2>
                {task.descricao ? <p>{task.descricao}</p> : null}
                <p>Created {dateFormatter.format(new Date(task.dataCriacao))}</p>
                <Link href={`/tasks/${task.id}/edit`}>Edit {task.titulo}</Link>
                <button
                  type="button"
                  onClick={() => deleteTask.mutate({ id: task.id })}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending ? 'Deleting…' : `Delete ${task.titulo}`}
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
