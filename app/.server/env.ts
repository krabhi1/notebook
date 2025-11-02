const env = {
  TURSO_CONNECTION_URL: "",
  TURSO_AUTH_TOKEN: "",
  BETTER_AUTH_SECRET: "",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
};

export type Env = typeof env;
//load from process.env if available
// This is just for local development
// @ts-ignore
if (typeof process !== "undefined" && process.env) {
  const { config } = await import("dotenv");
  config({ path: ".dev.vars" });
  // @ts-ignore
  env.TURSO_CONNECTION_URL = process.env.TURSO_CONNECTION_URL || "";
  // @ts-ignore
  env.TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "";
  // @ts-ignore
  env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "";
  // @ts-ignore
  env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  // @ts-ignore
  env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
}
export function setEnv(newEnv: Env) {
  Object.assign(env, newEnv);
}

export default env;
