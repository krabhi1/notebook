import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { z } from "zod";

const envSchema = z.discriminatedUnion("NODE_ENV", [
  z.object({
    NODE_ENV: z.literal("production"),
    TURSO_CONNECTION_URL: z.string().min(1),
    TURSO_AUTH_TOKEN: z.string().min(1),
  }),
  z.object({
    NODE_ENV: z.enum(["development", "test"]).optional(),
    DATABASE_URL: z.string().min(1),
  }),
]);

const env = envSchema.parse(process.env);
const isProduction = env.NODE_ENV === "production";
console.log(`Running in ${env.NODE_ENV} environment`);

export default defineConfig({
  schema: "./app/.server/db/schema.ts",
  out: "./migrations",
  dialect: isProduction ? "turso" : "sqlite",
  dbCredentials: isProduction
    ? {
        url: env.TURSO_CONNECTION_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      }
    : {
        url: `${env.DATABASE_URL}`,
      },
});
