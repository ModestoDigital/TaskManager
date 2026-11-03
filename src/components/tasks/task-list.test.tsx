import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { TaskList } from './task-list';

vi.mock('@/trpc/client', () => ({
  useTRPC: () => ({
    task: {
      list: {
        infiniteQueryOptions: () => ({
          queryKey: ['task', 'list'],
          queryFn: async () => ({ items: [] }),
          initialPageParam: undefined,
          getNextPageParam: () => undefined,
        }),
      },
      delete: {
        mutationOptions: () => ({ mutationFn: async () => ({ success: true }) }),
      },
    },
  }),
}));

it('shows an empty-state message', async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <TaskList />
    </QueryClientProvider>,
  );

  expect(await screen.findByText('No tasks yet. Create your first task.')).toBeTruthy();
});
