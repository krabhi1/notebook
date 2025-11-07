import { eq, and } from "drizzle-orm";
import type { DrizzleClient } from "../db";
import {
  folders,
  pages,
  type Folder,
  type NewFolder,
  type UpdateFolder,
  type Page,
} from "~/.server/db/schema";

export type FolderWithPages = Folder & {
  pages: Page[];
};

export class FolderRepository {
  constructor(private db: DrizzleClient) {}

  async getById(id: string): Promise<Folder | undefined> {
    const result = await this.db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.isDeleted, false)));
    return result[0];
  }

  async getByUser(userId: string): Promise<Folder[]> {
    return this.db
      .select()
      .from(folders)
      .where(and(eq(folders.userId, userId), eq(folders.isDeleted, false)))
      .orderBy(folders.updatedAt);
  }

  async getByUserWithPages(userId: string): Promise<FolderWithPages[]> {
    const rows = await this.db
      .select()
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
  }

  async getAll(): Promise<Folder[]> {
    return this.db
      .select()
      .from(folders)
      .where(eq(folders.isDeleted, false))
      .orderBy(folders.createdAt);
  }

  async create(data: NewFolder): Promise<Folder[]> {
    return this.db
      .insert(folders)
      .values({
        ...data,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }

  async update(id: string, data: UpdateFolder): Promise<void> {
    await this.db
      .update(folders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id));
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(folders)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id));
  }

  async hardDelete(id: string): Promise<void> {
    await this.db.delete(folders).where(eq(folders.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(folders)
      .where(and(eq(folders.id, id), eq(folders.isDeleted, false)));
    return result.length > 0;
  }

  async belongsToUser(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.id, id),
          eq(folders.userId, userId),
          eq(folders.isDeleted, false),
        ),
      );
    return result.length > 0;
  }
}
