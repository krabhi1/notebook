import { eq, and } from "drizzle-orm";
import { db } from "../index";
import {
  folders,
  pages,
  type Folder,
  type NewFolder,
  type UpdateFolder,
  type Page,
} from "../schema";

export type FolderWithPages = Folder & {
  pages: Page[];
};
export const FolderDAO = {
  getById: async (id: string): Promise<Folder | undefined> => {
    const result = await db()
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.isDeleted, false)));
    return result[0];
  },

  getByUser: async (userId: string): Promise<Folder[]> => {
    return db()
      .select()
      .from(folders)
      .where(and(eq(folders.userId, userId), eq(folders.isDeleted, false)))
      .orderBy(folders.updatedAt);
  },

  getByUserWithPages: async (userId: string): Promise<FolderWithPages[]> => {
    const rows = await db()
      .select({
        folder: folders,
        page: pages,
      })
      .from(folders)
      .leftJoin(pages, eq(pages.folderId, folders.id))
      .where(and(eq(folders.userId, userId), eq(folders.isDeleted, false)));

    // Map rows into nested structure
    const foldersMap = new Map<string, FolderWithPages>();

    rows.forEach(({ folder, page }) => {
      if (!foldersMap.has(folder.id)) {
        foldersMap.set(folder.id, { ...folder, pages: [] });
      }

      if (page && !page.isDeleted) {
        foldersMap.get(folder.id)!.pages.push(page);
      }
    });

    return Array.from(foldersMap.values());
  },

  getAll: async (): Promise<Folder[]> => {
    return db().select().from(folders).where(eq(folders.isDeleted, false));
  },

  create: async (data: NewFolder): Promise<Folder[]> => {
    return db()
      .insert(folders)
      .values({
        ...data,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  },

  update: async (id: string, data: UpdateFolder): Promise<void> => {
    await db()
      .update(folders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id));
  },

  softDelete: async (id: string): Promise<void> => {
    await db()
      .update(folders)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id));
  },

  hardDelete: async (id: string): Promise<void> => {
    await db().delete(folders).where(eq(folders.id, id));
  },

  exists: async (id: string): Promise<boolean> => {
    const result = await db()
      .select({ id: folders.id })
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.isDeleted, false)));
    return result.length > 0;
  },

  belongsToUser: async (id: string, userId: string): Promise<boolean> => {
    const result = await db()
      .select({ id: folders.id })
      .from(folders)
      .where(
        and(
          eq(folders.id, id),
          eq(folders.userId, userId),
          eq(folders.isDeleted, false),
        ),
      );
    return result.length > 0;
  },
};
