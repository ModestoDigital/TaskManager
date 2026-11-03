import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from '@/server/repositories/in-memory-task-repository';
import { TaskService } from '@/server/services/task-service';
import { createTRPCContext } from '@/trpc/init';
import { createTaskRouter } from './task';

function createCaller() {
  const service = new TaskService(new InMemoryTaskRepository(), {
    generateId: () => '72ff04a2-7061-4eb7-a0e7-d730a0c24132',
    now: () => new Date('2026-11-03T12:00:00.000Z'),
  });
  const router = createTaskRouter(service);
  return router.createCaller(() => createTRPCContext({ headers: new Headers() }));
}

describe('task router', () => {
  it('creates, lists, updates, and deletes tasks', async () => {
    const caller = await createCaller();
    const created = await caller.create({ titulo: 'Plan release' });

    await expect(caller.list({ limit: 20 })).resolves.toMatchObject({ items: [created] });
    await expect(caller.update({ id: created.id, titulo: 'Ship release' })).resolves.toMatchObject({
      titulo: 'Ship release',
    });
    await expect(caller.delete({ id: created.id })).resolves.toEqual({
      success: true,
      id: created.id,
    });
  });

  it('returns NOT_FOUND for an absent task', async () => {
    const caller = await createCaller();

    await expect(caller.getById({ id: '72ff04a2-7061-4eb7-a0e7-d730a0c24132' })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'NOT_FOUND' });
  });

  it('rejects an invalid title before the service is called', async () => {
    const caller = await createCaller();

    await expect(caller.create({ titulo: '   ' })).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'BAD_REQUEST',
    });
  });

  it('returns BAD_REQUEST for an invalid pagination cursor', async () => {
    const caller = await createCaller();

    await expect(caller.list({ cursor: 'not-a-cursor', limit: 1 })).rejects.toMatchObject<
      Partial<TRPCError>
    >({ code: 'BAD_REQUEST' });
  });
});
