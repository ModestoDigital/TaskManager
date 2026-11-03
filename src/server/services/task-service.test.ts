import { describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from '@/server/repositories/in-memory-task-repository';
import { TaskNotFoundError, TaskService } from './task-service';

function createService(ids = ['task-1', 'task-2', 'task-3']) {
  let index = 0;
  return new TaskService(new InMemoryTaskRepository(), {
    generateId: () => ids[index++] ?? `task-${index}`,
    now: () => new Date('2026-11-03T12:00:00.000Z'),
  });
}

describe('TaskService', () => {
  it('creates a task with server-controlled fields', () => {
    const task = createService().create({ titulo: 'Plan release', descricao: 'Prepare notes' });

    expect(task).toEqual({
      id: 'task-1',
      titulo: 'Plan release',
      descricao: 'Prepare notes',
      dataCriacao: '2026-11-03T12:00:00.000Z',
    });
  });

  it('orders equally dated tasks by descending id and paginates without duplicates', () => {
    const service = createService(['task-a', 'task-c', 'task-b']);
    service.create({ titulo: 'A' });
    service.create({ titulo: 'C' });
    service.create({ titulo: 'B' });

    const firstPage = service.list({ limit: 2 });
    const secondPage = service.list({ limit: 2, cursor: firstPage.nextCursor });

    expect(firstPage.items.map((task) => task.id)).toEqual(['task-c', 'task-b']);
    expect(secondPage.items.map((task) => task.id)).toEqual(['task-a']);
    expect(new Set([...firstPage.items, ...secondPage.items].map((task) => task.id)).size).toBe(3);
  });

  it('continues after a cursor when the cursor task is deleted', () => {
    const service = createService(['task-a', 'task-c', 'task-b']);
    service.create({ titulo: 'A' });
    service.create({ titulo: 'C' });
    service.create({ titulo: 'B' });

    const firstPage = service.list({ limit: 2 });
    service.delete(firstPage.items[1].id);
    const secondPage = service.list({ limit: 2, cursor: firstPage.nextCursor });

    expect(secondPage.items.map((task) => task.id)).toEqual(['task-a']);
  });

  it('updates editable fields without changing immutable fields', () => {
    const service = createService();
    const created = service.create({ titulo: 'Original', descricao: 'Description' });

    expect(service.update({ id: created.id, titulo: 'Updated', descricao: null })).toEqual({
      id: created.id,
      titulo: 'Updated',
      descricao: undefined,
      dataCriacao: created.dataCriacao,
    });
  });

  it('reports absent tasks for update and delete', () => {
    const service = createService();

    expect(() => service.update({ id: 'missing', titulo: 'Updated' })).toThrow(TaskNotFoundError);
    expect(() => service.delete('missing')).toThrow(TaskNotFoundError);
  });

  it('handles update and delete in either sequential event-loop order', async () => {
    const updateThenDelete = createService();
    const firstTask = updateThenDelete.create({ titulo: 'Original' });
    const firstResults = await Promise.allSettled([
      Promise.resolve().then(() => updateThenDelete.update({ id: firstTask.id, titulo: 'Updated' })),
      Promise.resolve().then(() => updateThenDelete.delete(firstTask.id)),
    ]);

    expect(firstResults.map((result) => result.status)).toEqual(['fulfilled', 'fulfilled']);
    expect(() => updateThenDelete.getById(firstTask.id)).toThrow(TaskNotFoundError);

    const deleteThenUpdate = createService();
    const secondTask = deleteThenUpdate.create({ titulo: 'Original' });
    const secondResults = await Promise.allSettled([
      Promise.resolve().then(() => deleteThenUpdate.delete(secondTask.id)),
      Promise.resolve().then(() => deleteThenUpdate.update({ id: secondTask.id, titulo: 'Updated' })),
    ]);

    expect(secondResults.map((result) => result.status)).toEqual(['fulfilled', 'rejected']);
    expect(() => deleteThenUpdate.getById(secondTask.id)).toThrow(TaskNotFoundError);
  });
});
