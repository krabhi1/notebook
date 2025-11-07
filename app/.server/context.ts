import { getDb } from "./db";
import { ServiceLocator } from "./services";
import { RepositoryLocator } from "./repos";
import { type AppLoadContext } from "react-router";
import { createAuth } from "./auth";

export interface AppServices {
  fileService: ServiceLocator["fileService"];
  folderService: ServiceLocator["folderService"];
  pageService: ServiceLocator["pageService"];
  userService: ServiceLocator["userService"];
}

export async function createAppContext(
  env: Env,
  ctx: ExecutionContext,
): Promise<AppLoadContext> {
  const appContext = { cloudflare: { env, ctx } } as AppLoadContext;
  const db = getDb({
    turso: {
      url: env.TURSO_CONNECTION_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    },
  });
  appContext.auth = createAuth(db, env);
  appContext.services = new ServiceLocator(new RepositoryLocator(db));
  return appContext;
}
