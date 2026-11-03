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
    if (
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      taskList.isFetchNextPageError
    ) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, taskList.isFetchNextPageError]);

  if (taskList.isLoading) {
    return <p role="status">Loading tasks…</p>;
  }

  if (taskList.isError && !taskList.data) {
    return <p role="alert">{taskList.error.message}</p>;
  }

  const tasks = taskList.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="task-list" aria-labelledby="task-list-title">
      <div className="task-list__header">
        <div>
          <p className="eyebrow">Your workspace</p>
        <h1 id="task-list-title">Tasks</h1>
        </div>
        <Link className="primary-link" href="/tasks/new">Create task</Link>
      </div>
      {deleteTask.error ? <p role="alert">{deleteTask.error.message}</p> : null}
      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Create your first task.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <article className="task-card">
                <h2>{task.titulo}</h2>
                {task.descricao ? <p className="task-card__description">{task.descricao}</p> : null}
                <p className="task-card__date">Created {dateFormatter.format(new Date(task.dataCriacao))}</p>
                <div className="task-card__actions">
                <Link href={`/tasks/${task.id}/edit`}>Edit task</Link>
                <button
                  className="task-card__delete"
                  type="button"
                  onClick={() => deleteTask.mutate({ id: task.id })}
                  disabled={deleteTask.isPending}
                >
                  <svg
                    aria-hidden="true"
                    className="task-card__delete-icon"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M4 7h16m-10 4v6m4-6v6M9 7l1-3h4l1 3m-8 0 1 13h8l1-13"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                  {deleteTask.isPending ? ' Deleting…' : ' Delete'}
                </button>
                </div>
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
