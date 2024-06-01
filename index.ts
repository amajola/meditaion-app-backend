import { appRouter } from "./src/router.ts";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { createAppContext } from "./src/util/context.ts";

createHTTPServer({
  router: appRouter,
  createContext: createAppContext,
}).listen({ port: 8000 });
