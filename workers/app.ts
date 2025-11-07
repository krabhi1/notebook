import { createRequestHandler, redirect } from "react-router";
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
    const appContext = await createAppContext(env, ctx);
    const url = new URL(request.url);
    if (url.pathname.startsWith("/app")) {
      const session = await appContext.auth.api.getSession(request);
      if (session) {
        appContext.session = session.session;
        appContext.user = session.user;
      } else {
        return redirect("/sign-in", 303);
      }
    }
    console.log({ appContext });
    return requestHandler(request, appContext);
  },
} satisfies ExportedHandler<Env>;
