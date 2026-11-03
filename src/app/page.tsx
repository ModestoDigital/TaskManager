import { TaskList } from '@/components/tasks/task-list';
import { getQueryClient, HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const queryClient = getQueryClient();
  await queryClient.fetchInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <main>
      <HydrateClient>
        <TaskList />
      </HydrateClient>
    </main>
  );
}
