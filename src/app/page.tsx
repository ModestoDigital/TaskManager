import { TaskList } from '@/components/tasks/task-list';
import { getQueryClient, HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const queryClient = getQueryClient();
  await queryClient.fetchQuery(trpc.task.list.queryOptions({ limit: 20 }));

  return (
    <main>
      <HydrateClient>
        <TaskList />
      </HydrateClient>
    </main>
  );
}
