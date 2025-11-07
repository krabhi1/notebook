import type { DrizzleClient } from "../db";
import { createAuthConfig } from "./config";
export const createAuth = (drizzleClient: DrizzleClient, env: Env) => {
  return createAuthConfig({
    drizzleClient,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
  });
};

export type BetterAuth = ReturnType<typeof createAuth>;
