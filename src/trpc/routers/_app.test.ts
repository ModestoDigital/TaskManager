import { describe, expect, it } from 'vitest';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

describe('appRouter', () => {
  it('exposes a type-safe health procedure', async () => {
    const caller = appRouter.createCaller(
      await createTRPCContext({ headers: new Headers() }),
    );

    await expect(caller.health()).resolves.toEqual({ status: 'ok' });
  });
});
