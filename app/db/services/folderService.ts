import { FolderDAO } from "../queries/folder";
import { PageDAO } from "../queries/page";
import { FileDAO } from "../queries/file";
import { UserDAO } from "../queries/user";
import { type Folder, type NewFolder, type UpdateFolder } from "../schema";

export const FolderService = {
  createFolder: async (data: {
    userId: string;
    name: string;
  }): Promise<Folder> => {
    // Validate user exists
    const userExists = await UserDAO.exists(data.userId);
    if (!userExists) {
      throw new Error(`User with id ${data.userId} not found`);
    }

    // Check for duplicate folder names for the user
    const existingFolders = await FolderDAO.getByUser(data.userId);
    const duplicateName = existingFolders.some(
      (folder) => folder.name.toLowerCase() === data.name.toLowerCase(),
    );

    if (duplicateName) {
      throw new Error(`Folder with name "${data.name}" already exists`);
    }

    const [folder] = await FolderDAO.create({
      userId: data.userId,
      name: data.name,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return folder;
  },

  getFolderById: async (id: string): Promise<Folder> => {
    const folder = await FolderDAO.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }
    return folder;
  },

  getFoldersByUser: async (userId: string): Promise<Folder[]> => {
    const userExists = await UserDAO.exists(userId);
    if (!userExists) {
      throw new Error(`User with id ${userId} not found`);
    }

    return FolderDAO.getByUser(userId);
  },

  getFoldersWithPages: async (userId: string) => {
    const userExists = await UserDAO.exists(userId);
    if (!userExists) {
      throw new Error(`User with id ${userId} not found`);
    }

    return FolderDAO.getByUserWithPages(userId);
  },

  updateFolder: async (
    id: string,
    data: UpdateFolder,
    userId?: string,
  ): Promise<void> => {
    const folder = await FolderDAO.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // If userId provided, validate ownership
    if (userId && folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    // Check for duplicate names if name is being updated
    if (data.name) {
      const siblingFolders = await FolderDAO.getByUser(folder.userId);
      const duplicateName = siblingFolders.some(
        (sibling) =>
          sibling.id !== id &&
          sibling.name.toLowerCase() === data.name!.toLowerCase(),
      );

      if (duplicateName) {
        throw new Error(`Folder with name "${data.name}" already exists`);
      }
    }

    await FolderDAO.update(id, data);
  },

  deleteFolder: async (
    id: string,
    userId?: string,
    options?: {
      hardDelete?: boolean;
    },
  ): Promise<void> => {
    const folder = await FolderDAO.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // If userId provided, validate ownership
    if (userId && folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    if (options?.hardDelete) {
      // Delete all pages and their files first
      const pages = await PageDAO.getByFolder(id);
      for (const page of pages) {
        await FileDAO.deleteByPage(page.id);
        await PageDAO.hardDelete(page.id);
      }

      await FolderDAO.hardDelete(id);
    } else {
      // Soft delete - mark folder and all its pages as deleted
      const pages = await PageDAO.getByFolder(id);
      for (const page of pages) {
        await PageDAO.softDelete(page.id);
      }

      await FolderDAO.softDelete(id);
    }
  },

  validateFolderAccess: async (
    folderId: string,
    userId: string,
  ): Promise<boolean> => {
    return FolderDAO.belongsToUser(folderId, userId);
  },

  getFolderWithPagesAndFiles: async (id: string, userId?: string) => {
    const folder = await FolderDAO.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // If userId provided, validate ownership
    if (userId && folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    const pages = await PageDAO.getByFolderWithFiles(id);

    return {
      ...folder,
      pages,
    };
  },

  duplicateFolder: async (
    id: string,
    newName: string,
    userId?: string,
  ): Promise<Folder> => {
    const folder = await FolderDAO.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // If userId provided, validate ownership
    if (userId && folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    // Create new folder
    const [newFolder] = await FolderDAO.create({
      userId: folder.userId,
      name: newName,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Duplicate all pages and their files
    const pages = await PageDAO.getByFolderWithFiles(id);
    for (const page of pages) {
      const [newPage] = await PageDAO.create({
        folderId: newFolder.id,
        name: page.name,
        type: page.type,
      });

      // Duplicate all files for this page
      if (page.files && page.files.length > 0) {
        const fileData = page.files.map((file) => ({
          name: file.name,
          lang: file.lang,
          content: file.content,
        }));
        await FileDAO.createMany(
          newPage.id,
          fileData.map((f) => ({
            ...f,
            lang: f.lang ?? undefined,
            content: f.content ?? undefined,
          })),
        );
      }
    }

    return newFolder;
  },

  getFolderStats: async (id: string, userId?: string) => {
    const folder = await FolderDAO.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // If userId provided, validate ownership
    if (userId && folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    const pages = await PageDAO.getByFolder(id);
    let totalFiles = 0;

    for (const page of pages) {
      const fileCount = await FileDAO.countByPage(page.id);
      totalFiles += fileCount;
    }

    return {
      id: folder.id,
      name: folder.name,
      pageCount: pages.length,
      fileCount: totalFiles,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    };
  },
};
