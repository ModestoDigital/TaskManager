import { initTRPC } from '@trpc/server';

export async function createTRPCContext({ headers }: { headers: Headers }) {
  return { headers };
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
