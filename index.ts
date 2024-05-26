import { appRouter } from "./src/router.ts";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { sessionTable, userTable } from "./src/auth/schema.ts";
import lucia, { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

const client = new Client({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "password",
  database: "meditation_app",
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

const server = createHTTPServer({ router: appRouter });
server.listen(8000);
