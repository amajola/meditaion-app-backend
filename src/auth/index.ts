import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { userTable } from "./schema";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { eq } from "drizzle-orm";
import type { AppContext } from "../util/context";

const t = initTRPC.context<AppContext>().create({});
export const publicProcedure = t.procedure;
export const router = t.router;

const signupOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  success: z.boolean(),
});

const AuthRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        name: z.string(),
      })
    )
    .output(signupOutputSchema)
    .mutation(async ({ input: { password, email, name }, ctx }) => {
      const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });
      const id = generateIdFromEntropySize(10); // 16 characters long
      try {
        const user = await ctx.database
          .insert(userTable)
          .values({ id, email, password: passwordHash, name })
          .returning({
            id: userTable.id,
            email: userTable.email,
            name: userTable.name,
  });

        return {
          success: true,
          ...user[0]
        };
      } catch (error) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User Already exists",
          cause: error,
        });
      }
    }),
  signin: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .output(signupOutputSchema)
    .mutation(async ({ input: { email, password }, ctx }) => {
      try {
        const user = await ctx.database.query.userTable.findFirst({
          where: eq(userTable.email, email),
        });

        if (!user) throw new Error("User not found");

        const validPassword = await verify(user.password, password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });
        if (!validPassword) throw new Error("User not found");

        ctx.createSession(user);
        return {
          success: true,
          email: user.email,
          id: user.id,
          name: user.name,
        };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invlid email or password",
          cause: error,
        });
      }
    }),
});

export type AuthRouter = typeof AuthRouter;
export default AuthRouter;
