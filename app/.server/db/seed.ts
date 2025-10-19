import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { reset, seed } from "drizzle-seed";

config({ path: ".dev.vars" });
import { drizzle } from "drizzle-orm/libsql";
import { users, folders, pages, files } from "./schema";

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

  // create 5 folders for the user with pages and each page with a few files
  // data should be realistic

  // Create 5 folders for the user
  const folderData = [
    {
      name: "Personal Projects",
    },
    {
      name: "Work Documents",
    },
    {
      name: "Learning Resources",
    },
    {
      name: "Design Assets",
    },
    {
      name: "Meeting Notes",
    },
  ];

  for (const folderInfo of folderData) {
    // Create folder
    const [folder] = await db
      .insert(folders)
      .values({
        name: folderInfo.name,
        userId: "abhi",
      })
      .returning();

    // Create 2-3 pages per folder
    const pageCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 pages

    for (let i = 0; i < pageCount; i++) {
      const pageNames: Record<string, string[]> = {
        "Personal Projects": [
          `React Todo App`,
          `Python Web Scraper`,
          `Mobile Game Prototype`,
        ],
        "Work Documents": [
          `Q4 Planning`,
          `API Documentation`,
          `Team Standup Notes`,
        ],
        "Learning Resources": [
          `JavaScript Concepts`,
          `System Design Notes`,
          `Algorithm Practice`,
        ],
        "Design Assets": [
          `Login Page Mockup`,
          `Brand Guidelines`,
          `Icon Library`,
        ],
        "Meeting Notes": [
          `Sprint Planning`,
          `Client Call Summary`,
          `Architecture Review`,
        ],
      };

      const pageName = pageNames[folderInfo.name]?.[i] || `Page ${i + 1}`;

      const [page] = await db
        .insert(pages)
        .values({
          id: `page_${pageName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}_${i}`,
          name: pageName,
          type: "editorjs",
          folderId: folder.id,
        })
        .returning();

      // Create 2-4 files per page
      const fileCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 files

      for (let j = 0; j < fileCount; j++) {
        const fileTypes = ["js", "md", "png", "pdf", "json", "css", "html"];
        const fileType =
          fileTypes[Math.floor(Math.random() * fileTypes.length)];
        const fileName = `${pageName.toLowerCase().replace(/\s+/g, "_")}_${j + 1}.${fileType}`;

        await db.insert(files).values({
          name: fileName,
          lang: fileType,
          content: `Sample content for ${fileName}`,
          pageId: page.id,
        });
      }
    }

    console.log(`Created folder: ${folder.name} with ${pageCount} pages`);
  }

  console.log("Successfully created 5 folders with pages and files!");
}

main();
