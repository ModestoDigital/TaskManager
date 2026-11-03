import { baseProcedure, createTRPCRouter } from '@/trpc/init';

export const appRouter = createTRPCRouter({
  health: baseProcedure.query(() => ({ status: 'ok' as const })),
});

export type AppRouter = typeof appRouter;
