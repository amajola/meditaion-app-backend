import { initTRPC } from "@trpc/server";
import  authRouter  from "./auth/";

const t = initTRPC.create();

export const publicProcedure = t.procedure;
export const router = t.router;


export const appRouter = router({
  auth: authRouter
});

export const createCaller = t.createCallerFactory(appRouter)
export type AppRouter = typeof appRouter;
