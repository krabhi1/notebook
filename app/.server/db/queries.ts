import { db } from ".";
import { eq, desc, sql, or, and } from "drizzle-orm";
import type {
  NewUser,
  User,
  Folder,
  NewPage,
  Page,
  PageMeta,
  UpdateUser,
  UpdateFolder,
  UpdatePage,
} from "./schema";
import { users, folders, pages } from "./schema";
// ==============
// USER
// ==============
export async function createUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}
export async function getUser(id: string): Promise<User | null> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
    .get();
  return user || null;
}
export async function updateUser(id: string, data: UpdateUser): Promise<User> {
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return user;
}

// ==============
// FOLDER
// ==============
export async function createFolder(
  userId: string,
  name: string,
): Promise<Folder> {
  const [folder] = await db
    .insert(folders)
    .values({ userId, name, createdAt: new Date() })
    .returning();
  return folder;
}
export async function getFolders(userId: string): Promise<Folder[]> {
  const folderList = await db
    .select()
    .from(folders)
    .where(and(eq(folders.userId, userId), eq(folders.isDeleted, false)))
    .orderBy(desc(folders.createdAt));
  return folderList;
}
export async function getFolder(
  folderId: string,
  userId: string,
): Promise<Folder | null> {
  const folder = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.id, folderId),
        eq(folders.userId, userId),
        eq(folders.isDeleted, false),
      ),
    )
    .limit(1)
    .get();
  return folder || null;
}
export async function updateFolder(
  folderId: string,
  userId: string,
  data: UpdateFolder,
): Promise<Folder> {
  const [folder] = await db
    .update(folders)
    .set(data)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
    .returning();
  return folder;
}
export async function deleteFolder(
  folderId: string,
  userId: string,
): Promise<void> {
  // soft-delete
  await db
    .update(folders)
    .set({ isDeleted: true })
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)));
}

// ==============
// PAGE
// ==============
export async function createPage(
  folderId: string,
  data: NewPage,
): Promise<Page> {
  const [page] = await db
    .insert(pages)
    .values({
      ...data,
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return page;
}
export async function getPages(folderId: string): Promise<PageMeta[]> {
  const pageList = await db
    .select({
      id: pages.id,
      name: pages.name,
      type: pages.type,
      updatedAt: pages.updatedAt,
      createdAt: pages.createdAt,
      // ⚠️ intentionally omit: content, options, folderId, isDeleted
    })
    .from(pages)
    .where(and(eq(pages.folderId, folderId), eq(pages.isDeleted, false)))
    .orderBy(desc(pages.createdAt));
  return pageList;
} // meta only
export async function getPage(pageId: string): Promise<Page | null> {
  const page = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, pageId), eq(pages.isDeleted, false)))
    .limit(1)
    .get();
  return page || null;
} // full content
export async function updatePage(
  pageId: string,
  data: UpdatePage,
): Promise<void> {
  await db
    .update(pages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pages.id, pageId));
}
export async function deletePage(pageId: string): Promise<void> {
  // soft-delete
  await db.update(pages).set({ isDeleted: true }).where(eq(pages.id, pageId));
}

// ==============
// TRASH (restore)
// ==============
export async function restorePage(pageId: string): Promise<void> {
  await db.update(pages).set({ isDeleted: false }).where(eq(pages.id, pageId));
}
export async function restoreFolder(
  folderId: string,
  userId: string,
): Promise<void> {
  await db
    .update(folders)
    .set({ isDeleted: false })
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)));
}
export async function getDeletedPages(): Promise<PageMeta[]> {
  return db
    .select({
      id: pages.id,
      name: pages.name,
      type: pages.type,
      updatedAt: pages.updatedAt,
      createdAt: pages.createdAt,
    })
    .from(pages)
    .where(eq(pages.isDeleted, true));
}
