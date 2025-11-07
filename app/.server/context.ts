import { getDb } from "./db";
import { ServiceLocator } from "./services";
import { auth } from "./auth";
import { RepositoryLocator } from "./repos";
import type { AppLoadContext } from "react-router";

export interface AppServices {
  fileService: ServiceLocator["fileService"];
  folderService: ServiceLocator["folderService"];
  pageService: ServiceLocator["pageService"];
  userService: ServiceLocator["userService"];
}

export function createAppContext(
  env: Env,
  ctx: ExecutionContext,
): AppLoadContext {
  const db = getDb({
    turso: {
      url: env.TURSO_CONNECTION_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    },
  });
  const repositoryLocator = new RepositoryLocator(db);
  const serviceLocator = new ServiceLocator(repositoryLocator);

  const services: AppServices = {
    fileService: serviceLocator.fileService,
    folderService: serviceLocator.folderService,
    pageService: serviceLocator.pageService,
    userService: serviceLocator.userService,
  };

  return {
    db,
    services,
    auth,
    session: {},
    user: {},
    cloudflare: { env, ctx },
  } as unknown as AppLoadContext;
}
