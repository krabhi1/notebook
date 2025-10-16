import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { reset, seed } from "drizzle-seed";

config({ path: ".dev.vars" });
import { drizzle } from "drizzle-orm/libsql";
import { users } from "./schema";

async function main() {
  const db = drizzle({
    connection: {
      url: process.env.TURSO_CONNECTION_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  });
  await reset(db, { users });
  //create a user
  const user = await db
    .insert(users)
    .values({
      id: "abhi",
      email: "abhi@gmail.com",
      name: "Abhi",
      imageUrl: "https://avatars.githubusercontent.com/u/559929?v=4",
      onBoarded: true,
    })
    .returning();
  console.log("Created user:", user);
}

main();
