import { appRouter } from "./src/router.ts";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { sessionTable, userTable } from "./src/auth/schema.ts";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { createContext } from "./src/auth/index.ts";
import { Lucia } from "lucia";
import { ENV } from "./src/util/env.ts";

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
  userTable,
);

export const lucia = new Lucia(AuthAdapter, {
	sessionCookie: {
		attributes: {
			secure:  ENV.NODE_ENV === "production" // set `Secure` flag in HTTPS
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// we don't need to expose the password hash!
			email: attributes.email
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			email: string;
		};
	}
}

const server = createHTTPServer({ router: appRouter, createContext });
server.listen(8001);
