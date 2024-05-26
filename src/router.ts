import { initTRPC } from "@trpc/server";
import  authRouter  from "./auth";

const t = initTRPC.create();

export const publicProcedure = t.procedure;
export const router = t.router;


export const appRouter = router({
  auth: authRouter
});

export type AppRouter = typeof appRouter;
