import * as schema from "./schema";
import { drizzle } from "drizzle-orm/libsql";

export type GetDbParams = {
  databaseURL?: string;
  turso?: {
    url: string;
    authToken: string;
  };
};

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

export const getDb = ({ databaseURL: filePath, turso }: GetDbParams) => {
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
    return drizzle(`${filePath}`, { schema });
  }
  throw new Error(
    `No database binding provided ${JSON.stringify({ filePath, turso })}`,
  );
};
