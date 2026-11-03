import { describe, expect, it } from 'vitest';
import { createTaskInputSchema, updateTaskInputSchema } from './task';

describe('task schemas', () => {
  it('trims valid titles', () => {
    expect(createTaskInputSchema.parse({ titulo: '  Plan release  ' })).toEqual({
      titulo: 'Plan release',
    });
  });

  it.each(['', ' ', '\t\n'])('rejects an empty title: %j', (titulo) => {
    expect(() => createTaskInputSchema.parse({ titulo })).toThrow();
  });

  it('requires at least one editable field during updates', () => {
    expect(() =>
      updateTaskInputSchema.parse({ id: '72ff04a2-7061-4eb7-a0e7-d730a0c24132' }),
    ).toThrow();
  });
});
