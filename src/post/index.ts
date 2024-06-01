import { TRPCError, initTRPC } from "@trpc/server";
import { type AppContext } from "../util/context";
import { postTable } from "./schema";
import { z } from "zod";

const t = initTRPC.context<AppContext>().create({});
export const publicProcedure = t.procedure;
export const router = t.router;

export const protectedProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Is not authorized for this operation",
    });
  }

  return opts.next({});
});

const postOutputSchema = z
  .object({
    id: z.number(),
    userId: z.number(),
    qoute: z.string(),
    isCountDown: z.boolean(),
    countDownDate: z.union([z.date(), z.null()]),
    content: z.string(),
    createdAt: z.date(),
  })
  .or(z.undefined());

const postInputSchema = z.object({
  qoute: z.string(),
  content: z.string(),
  isCountDown: z.boolean(),
  countDownDate: z.string(),
});

const PostRouter = router({
  createpost: protectedProcedure
    .input(postInputSchema)
    .output(postOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, database } = ctx;

      if (session) {
        const [post] = await database
          .insert(postTable)
          .values({
            userId: session.userId,
            ...input,
            countDownDate: input.isCountDown
              ? new Date(input.countDownDate)
              : null,
          })
          .returning();

        return post;
      }
    }),
});

export default PostRouter;
