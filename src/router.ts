import { TRPCError, initTRPC } from "@trpc/server";
import authRouter from "./auth/";
import type { AppContext } from "./util/context";
import PostRouter from "./post";

const t = initTRPC.context<AppContext>().create();

export const publicProcedure = t.procedure;
export const router = t.router;

export const protectedProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  console.log(ctx)
  return opts.next({});
});

export const appRouter = router({
  auth: authRouter,
  post: PostRouter,
});

export const createCaller = t.createCallerFactory(appRouter);
export type AppRouter = typeof appRouter;
