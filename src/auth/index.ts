import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { AuthAdapter, database } from "../..";
import { userTable } from "./schema";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { eq } from "drizzle-orm";
import { serializeCookie } from "oslo/cookie";

interface ContextInterface {
  req: Request;
  res: Response;
}

export const createContext = async ({ req, res }: ContextInterface) => {
  return {
    req,
    res,
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<{req: Request, res: Response}>().create();
export const publicProcedure = t.procedure;
export const router = t.router;

export default router({
  user: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input: { password, email, name } }) => {
      const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });
      const id = generateIdFromEntropySize(10); // 16 characters long
      try {
        return await database
          .insert(userTable)
          .values({ id, email, password: passwordHash, name })
          .returning();
      } catch (error) {
        return error;
      }
    }),
  signin: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input: { email, password }, ctx}) => {
      const today = new Date();
      try {
        const user = await database.query.userTable.findFirst({
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

        const sessionExists = await AuthAdapter.getUserSessions(user.id);

        if (!sessionExists) {
          await AuthAdapter.setSession({
            userId: user.id,
            expiresAt: new Date(today.getDay() + 1),
            id: "",
            attributes: {},
          });

          const session = await AuthAdapter.getUserSessions(user.id);

          return {
            status: 302,
            headers: {
              Location: "/",
              "Set-Cookie": session,
            },
          };
        }

        console.log(ctx);
        // ctx.res.headers.set('Content-Type', 'application/json');
        // ctx.res.headers.set('Custom-Header', 'SomeValue');
        return {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": sessionExists.toString(),
          },
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
