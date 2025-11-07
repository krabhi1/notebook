import { createRequestHandler } from "react-router";
import { createAppContext } from "~/.server/context";
import type { AppServices } from "~/.server/context";
import type { User, Session } from "better-auth";
import type { BetterAuth } from "~/.server/auth";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    auth: BetterAuth;
    session: Session;
    user: User;
    services: AppServices;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    console.log(request.method, request.url);
    return requestHandler(request, createAppContext(env, ctx));
  },
} satisfies ExportedHandler<Env>;
