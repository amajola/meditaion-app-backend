// context.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "./env";
import { sessionTable, userTable, type UserType } from "../auth/schema";
import { Client } from "pg";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Lucia, type Session } from "lucia";

const client = new Client({
  host: ENV.DB_HOST,
  port: Number(ENV.DB_PORT),
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
});

await client.connect();

export const database = drizzle(client, {
  schema: { sessionTable, userTable },
});

export const AuthAdapter = new DrizzlePostgreSQLAdapter(
  database,
  sessionTable,
  userTable
);

interface Register {
  Lucia: typeof lucia;
  UserId: number;
  email: string;
}

export const lucia = new Lucia(AuthAdapter, {
  sessionCookie: {
    attributes: {
      secure: ENV.NODE_ENV === "production", // set `Secure` flag in HTTPS
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // we don't need to expose the password hash!
      email: attributes.email,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    UserId: number;
    email: string;
  }
}

type createSessionType = Omit<UserType, "password">;
export async function createAppContext(opts: CreateNextContextOptions) {
  const createSession = async (user: createSessionType) => {
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return { cookie: sessionCookie.serialize(), cookieId: session.id };
  };

  const sessionId = lucia.readBearerToken(opts.req.headers.authorization ?? "");
  const { session } = await lucia.validateSession(sessionId ?? "");

  return {
    ...opts,
    database,
    createSession,
    session,
  };
}

export type AppContext = Awaited<ReturnType<typeof createAppContext>>;
