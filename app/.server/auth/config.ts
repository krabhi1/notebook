import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DrizzleClient } from "../db";
import * as schema from "./schema";

type CreateAuthOptions = {
  googleClientId?: string;
  googleClientSecret?: string;
  drizzleClient: DrizzleClient;
};

export function createAuthConfig({
  googleClientId = "dummy",
  googleClientSecret = "dummy",
  drizzleClient,
}: CreateAuthOptions) {
  return betterAuth({
    database: drizzleAdapter(drizzleClient, {
      provider: "sqlite",
      schema: {
        user: schema.users,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    socialProviders: {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
    },
  });
}
