import { z } from "zod";
import { createAuthConfig } from "./app/.server/auth/config";
import { getDb } from "./app/.server/db";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const env = envSchema.parse(process.env);

export const auth = createAuthConfig({
  drizzleClient: getDb({
    databaseURL: env.DATABASE_URL,
  }),
  googleClientId: env.GOOGLE_CLIENT_ID,
  googleClientSecret: env.GOOGLE_CLIENT_SECRET,
});
