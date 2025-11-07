import { FolderRepository } from "../repos/folderRepository";
import { PageRepository } from "../repos/pageRepository";
import { FileRepository } from "../repos/fileRepository";
import { UserRepository } from "../repos/userRepository";
import {
  type Folder,
  type NewFolder,
  type UpdateFolder,
} from "~/.server/db/schema";
import type { FolderWithPages } from "../repos/folderRepository";

export class FolderService {
  constructor(
    private folderRepository: FolderRepository,
    private pageRepository: PageRepository,
    private fileRepository: FileRepository,
    private userRepository: UserRepository,
  ) {}

  async createFolder(data: { userId: string; name: string }): Promise<Folder> {
    // Validate user exists
    const userExists = await this.userRepository.exists(data.userId);
    if (!userExists) {
      throw new Error(`User with id ${data.userId} not found`);
    }

    // Check for duplicate folder names for the user
    const existingFolders = await this.folderRepository.getByUser(data.userId);
    const duplicateName = existingFolders.some(
      (folder) => folder.name.toLowerCase() === data.name.toLowerCase(),
    );

    if (duplicateName) {
      throw new Error(`Folder with name "${data.name}" already exists`);
    }

    const [folder] = await this.folderRepository.create({
      userId: data.userId,
      name: data.name,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return folder;
  }

  async getFolderById(id: string, userId?: string): Promise<Folder> {
    const folder = await this.folderRepository.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // If userId provided, validate ownership
    if (userId && folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    return folder;
  }

  async getFoldersByUser(userId: string): Promise<Folder[]> {
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      throw new Error(`User with id ${userId} not found`);
    }

    return this.folderRepository.getByUser(userId);
  }

  async getFoldersWithPages(userId: string): Promise<FolderWithPages[]> {
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      throw new Error(`User with id ${userId} not found`);
    }

    return this.folderRepository.getByUserWithPages(userId);
  }

  async updateFolder(
    id: string,
    data: UpdateFolder,
    userId: string,
  ): Promise<void> {
    const folder = await this.folderRepository.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // Validate ownership
    if (folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    // Check for duplicate names if name is being changed
    if (data.name && data.name !== folder.name) {
      const existingFolders = await this.folderRepository.getByUser(userId);
      const duplicateName = existingFolders.some(
        (existingFolder) =>
          existingFolder.id !== id &&
          existingFolder.name.toLowerCase() === data.name?.toLowerCase(),
      );

      if (duplicateName) {
        throw new Error(`Folder with name "${data.name}" already exists`);
      }
    }

    await this.folderRepository.update(id, data);
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    const folder = await this.folderRepository.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // Validate ownership
    if (folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    // Soft delete the folder
    await this.folderRepository.softDelete(id);
  }

  async hardDeleteFolder(id: string, userId: string): Promise<void> {
    const folder = await this.folderRepository.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // Validate ownership
    if (folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    // Hard delete the folder (this will cascade delete pages and files)
    await this.folderRepository.hardDelete(id);
  }

  async validateFolderAccess(
    folderId: string,
    userId: string,
  ): Promise<boolean> {
    return this.folderRepository.belongsToUser(folderId, userId);
  }

  async folderExists(id: string): Promise<boolean> {
    return this.folderRepository.exists(id);
  }

  async getFolderPageCount(id: string, userId?: string): Promise<number> {
    // If userId provided, validate ownership first
    if (userId) {
      const hasAccess = await this.validateFolderAccess(id, userId);
      if (!hasAccess) {
        throw new Error(
          `Unauthorized: Folder does not belong to user ${userId}`,
        );
      }
    }

    const pages = await this.pageRepository.getByFolder(id);
    return pages.length;
  }

  async getAllFolders(): Promise<Folder[]> {
    return this.folderRepository.getAll();
  }

  async restoreFolder(id: string, userId: string): Promise<void> {
    const folder = await this.folderRepository.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // Validate ownership
    if (folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    // For restore functionality, we'd need to implement undelete
    // This would require updating the soft delete to set isDeleted back to false
    await this.folderRepository.update(id, { isDeleted: false });
  }

  async duplicateFolder(
    id: string,
    newName: string,
    userId: string,
  ): Promise<Folder> {
    const folder = await this.folderRepository.getById(id);
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }

    // Validate ownership
    if (folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    // Create new folder with the new name
    const [newFolder] = await this.folderRepository.create({
      userId: folder.userId,
      name: newName,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Copy all pages from the original folder to the new folder
    const pages = await this.pageRepository.getByFolder(id);
    for (const page of pages) {
      const [newPage] = await this.pageRepository.create({
        folderId: newFolder.id,
        name: page.name,
        type: page.type,
      });

      // Copy all files from the original page to the new page
      const files = await this.fileRepository.getByPage(page.id);
      if (files.length > 0) {
        const fileData = files.map((file) => ({
          name: file.name,
          lang: file.lang,
          content: file.content,
        }));
        await this.fileRepository.createMany(newPage.id, fileData);
      }
    }

    return newFolder;
  }
}
