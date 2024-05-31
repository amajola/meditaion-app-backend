import { initTRPC } from "@trpc/server";
import type { AppContext } from "../util/context";

const t = initTRPC.context<AppContext>().create({});
export const publicProcedure = t.procedure;
export const router = t.router;

export const protectedProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  console.log(ctx.req.headers);
  return opts.next({});
});

const PostRouter = router({
  getPosts: protectedProcedure.query(async ({ ctx }) => {
    return {};
  }),
});

export default PostRouter;
