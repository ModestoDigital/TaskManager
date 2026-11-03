import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { TaskForm } from './task-form';

const createMutation = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/trpc/client', () => ({
  useTRPC: () => ({
    task: {
      create: { mutationOptions: () => ({ mutationFn: createMutation }) },
      update: { mutationOptions: () => ({ mutationFn: vi.fn() }) },
    },
  }),
}));

it('does not submit a whitespace-only title', async () => {
  const user = userEvent.setup();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <TaskForm />
    </QueryClientProvider>,
  );

  await user.type(screen.getByLabelText('Title'), '   ');
  await user.click(screen.getByRole('button', { name: 'Create task' }));

  expect(screen.getByRole('alert').textContent).toContain('Title is required.');
  expect(createMutation).not.toHaveBeenCalled();
});
