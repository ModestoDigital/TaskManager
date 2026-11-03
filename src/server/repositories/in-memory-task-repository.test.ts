import { describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from './in-memory-task-repository';

const task = {
  id: 'task-1',
  titulo: 'Original title',
  descricao: 'Original description',
  dataCriacao: '2026-11-03T12:00:00.000Z',
};

describe('InMemoryTaskRepository', () => {
  it('isolates stored tasks from caller mutation', () => {
    const repository = new InMemoryTaskRepository();
    const createdTask = repository.create(task);
    createdTask.titulo = 'Changed outside repository';

    expect(repository.findById(task.id)).toEqual(task);
  });

  it('updates, lists, and deletes tasks', () => {
    const repository = new InMemoryTaskRepository();
    repository.create(task);

    repository.update({ ...task, titulo: 'Updated title' });
    expect(repository.list()).toEqual([{ ...task, titulo: 'Updated title' }]);
    expect(repository.delete(task.id)).toBe(true);
    expect(repository.findById(task.id)).toBeUndefined();
  });
});
