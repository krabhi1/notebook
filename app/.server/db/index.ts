import * as schema from "./schema";
import { drizzle } from "drizzle-orm/libsql";

interface GetDbParams {
  filePath?: string;
  turso?: {
    url: string;
    authToken: string;
  };
}

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

export const getDb = ({ filePath, turso }: GetDbParams) => {
  if (turso) {
    return drizzle({
      connection: {
        url: turso.url,
        authToken: turso.authToken,
      },
      schema,
    });
  }
  if (filePath) {
    return drizzle(`file:${filePath}`, { schema });
  }
  throw new Error(
    `No database binding provided ${JSON.stringify({ filePath, turso })}`,
  );
};
