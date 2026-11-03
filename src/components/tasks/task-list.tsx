'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useTRPC } from '@/trpc/client';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

export function TaskList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const taskList = useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = taskList;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    }),
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (taskList.isLoading) {
    return <p role="status">Loading tasks…</p>;
  }

  if (taskList.isError && !taskList.data) {
    return <p role="alert">{taskList.error.message}</p>;
  }

  const tasks = taskList.data?.pages.flatMap((page) => page.items) ?? [];

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
      <div ref={sentinelRef} aria-hidden="true" />
      {taskList.isFetchingNextPage ? <p role="status">Loading more tasks…</p> : null}
      {taskList.isFetchNextPageError ? (
        <div role="alert">
          <p>Unable to load more tasks.</p>
          <button type="button" onClick={() => void taskList.fetchNextPage()}>
            Retry loading more tasks
          </button>
        </div>
      ) : null}
    </section>
  );
}
