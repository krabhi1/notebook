import { PageRepository } from "../repos/pageRepository";
import { FileRepository } from "../repos/fileRepository";
import { FolderRepository } from "../repos/folderRepository";
import { type Page, type NewPage, type UpdatePage } from "~/.server/db/schema";
import type { PageWithFiles } from "../repos/pageRepository";
import {
  defaultJsContent,
  defaultWebContent,
  defaultMermaidContent,
  defaultDatabaseContent,
  defaultEditorJsContent,
  defaultCircuitContent,
} from "~/lib/constants";

export class PageService {
  constructor(
    private pageRepository: PageRepository,
    private fileRepository: FileRepository,
    private folderRepository: FolderRepository,
  ) {}

  async createPage(data: {
    folderId: string;
    name: string;
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit";
    userId?: string;
  }): Promise<Page> {
    // Validate folder exists
    const folder = await this.folderRepository.getById(data.folderId);
    if (!folder) {
      throw new Error(`Folder with id ${data.folderId} not found`);
    }

    // If userId provided, validate folder ownership
    if (data.userId && folder.userId !== data.userId) {
      throw new Error(
        `Unauthorized: Folder does not belong to user ${data.userId}`,
      );
    }

    const [page] = await this.pageRepository.create({
      folderId: data.folderId,
      name: data.name,
      type: data.type,
    });

    return page;
  }

  async createPageWithDefaultFiles(
    folderId: string,
    name: string,
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit",
    userId?: string,
  ): Promise<Page> {
    // Create the page first
    const page = await this.createPage({ folderId, name, type, userId });

    // Create default files based on page type
    const defaultFiles = this.getDefaultFilesForType(type);

    if (defaultFiles.length > 0) {
      await this.fileRepository.createMany(page.id, defaultFiles);
    }

    return page;
  }

  async getPageById(id: string, userId?: string): Promise<Page> {
    const page = await this.pageRepository.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    return page;
  }

  async getPageWithFiles(id: string, userId?: string): Promise<PageWithFiles> {
    // Validate access first
    if (userId) {
      await this.getPageById(id, userId);
    }

    const pageWithFiles = await this.pageRepository.getByIdWithFiles(id);
    if (!pageWithFiles) {
      throw new Error(`Page with id ${id} not found`);
    }

    return pageWithFiles;
  }

  async getPagesByFolder(folderId: string, userId?: string): Promise<Page[]> {
    // If userId provided, validate folder ownership
    if (userId) {
      const folder = await this.folderRepository.getById(folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(
          `Unauthorized: Folder does not belong to user ${userId}`,
        );
      }
    }

    return this.pageRepository.getByFolder(folderId);
  }

  async updatePage(
    id: string,
    data: UpdatePage,
    userId?: string,
  ): Promise<void> {
    const page = await this.pageRepository.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }

      // If moving to a new folder, validate access to destination folder
      if (data.folderId && data.folderId !== page.folderId) {
        const destinationFolder = await this.folderRepository.getById(
          data.folderId,
        );
        if (!destinationFolder || destinationFolder.userId !== userId) {
          throw new Error(
            `Unauthorized: Destination folder does not belong to user ${userId}`,
          );
        }
      }
    }

    await this.pageRepository.update(id, data);
  }

  async deletePage(id: string, userId?: string): Promise<void> {
    const page = await this.pageRepository.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    // Soft delete the page
    await this.pageRepository.softDelete(id);
  }

  async hardDeletePage(id: string, userId?: string): Promise<void> {
    const page = await this.pageRepository.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    // Hard delete the page (this will cascade delete files)
    await this.pageRepository.hardDelete(id);
  }

  async validatePageAccess(pageId: string, userId: string): Promise<boolean> {
    const page = await this.pageRepository.getById(pageId);
    if (!page) return false;

    return this.folderRepository.belongsToUser(page.folderId, userId);
  }

  async pageExists(id: string): Promise<boolean> {
    return this.pageRepository.exists(id);
  }

  async pageBelongsToFolder(id: string, folderId: string): Promise<boolean> {
    return this.pageRepository.belongsToFolder(id, folderId);
  }

  async getPagesByType(
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit",
    userId?: string,
  ): Promise<Page[]> {
    const pages = await this.pageRepository.getByType(type);

    // If userId provided, filter pages to only those accessible by the user
    if (userId) {
      const accessiblePages: Page[] = [];

      for (const page of pages) {
        try {
          const folder = await this.folderRepository.getById(page.folderId);
          if (folder && folder.userId === userId) {
            accessiblePages.push(page);
          }
        } catch (error) {
          // Skip pages that can't be accessed
          continue;
        }
      }

      return accessiblePages;
    }

    return pages;
  }

  async countPagesByFolder(folderId: string): Promise<number> {
    return this.pageRepository.countByFolder(folderId);
  }

  async movePageToFolder(
    id: string,
    newFolderId: string,
    userId?: string,
  ): Promise<void> {
    const page = await this.pageRepository.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access to both folders
    if (userId) {
      const currentFolder = await this.folderRepository.getById(page.folderId);
      const destinationFolder =
        await this.folderRepository.getById(newFolderId);

      if (!currentFolder || currentFolder.userId !== userId) {
        throw new Error(
          `Unauthorized: Current page folder does not belong to user ${userId}`,
        );
      }

      if (!destinationFolder || destinationFolder.userId !== userId) {
        throw new Error(
          `Unauthorized: Destination folder does not belong to user ${userId}`,
        );
      }
    }

    await this.pageRepository.moveToFolder(id, newFolderId);
  }

  async duplicatePage(
    id: string,
    newName: string,
    destinationFolderId?: string,
    userId?: string,
  ): Promise<Page> {
    const page = await this.pageRepository.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    const targetFolderId = destinationFolderId || page.folderId;

    // If userId provided, validate access
    if (userId) {
      const sourceFolder = await this.folderRepository.getById(page.folderId);
      const targetFolder = await this.folderRepository.getById(targetFolderId);

      if (!sourceFolder || sourceFolder.userId !== userId) {
        throw new Error(
          `Unauthorized: Source page folder does not belong to user ${userId}`,
        );
      }

      if (!targetFolder || targetFolder.userId !== userId) {
        throw new Error(
          `Unauthorized: Target folder does not belong to user ${userId}`,
        );
      }
    }

    // Create the new page
    const [newPage] = await this.pageRepository.create({
      folderId: targetFolderId,
      name: newName,
      type: page.type,
    });

    // Copy all files from the original page
    const files = await this.fileRepository.getByPage(id);
    if (files.length > 0) {
      const fileData = files.map((file) => ({
        name: file.name,
        lang: file.lang,
        content: file.content,
      }));
      await this.fileRepository.createMany(newPage.id, fileData);
    }

    return newPage;
  }

  async getAllPages(): Promise<Page[]> {
    return this.pageRepository.getAll();
  }

  private getDefaultFilesForType(
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit",
  ): Array<{ name: string; lang?: string; content?: string }> {
    switch (type) {
      case "code":
        return [
          {
            name: "main.js",
            lang: "javascript",
            content: defaultJsContent,
          },
          {
            name: "utils.js",
            lang: "javascript",
            content:
              "// Utility functions\n\nfunction log(message) {\n  console.log(message);\n}\n\nfunction isEmpty(value) {\n  return value == null || value === '';\n}\n\nmodule.exports = {\n  log,\n  isEmpty\n};",
          },
          {
            name: "config.json",
            lang: "json",
            content:
              '{\n  "name": "My Project",\n  "version": "1.0.0",\n  "description": "A JavaScript project",\n  "main": "main.js"\n}',
          },
          {
            name: "README.md",
            lang: "markdown",
            content:
              "# My Project\n\nThis is a JavaScript project created with the code editor.\n\n## Getting Started\n\n1. Edit the files in this project\n2. Run your code\n3. Build something amazing!\n\n## Files\n\n- `main.js` - The main entry point\n- `utils.js` - Utility functions\n- `config.json` - Project configuration\n",
          },
        ];
      case "web":
        return [
          {
            name: "index.html",
            lang: "html",
            content: defaultWebContent.html,
          },
          {
            name: "style.css",
            lang: "css",
            content: defaultWebContent.css,
          },
          {
            name: "script.js",
            lang: "javascript",
            content: defaultWebContent.js,
          },
        ];
      case "mermaid":
        return [
          {
            name: "diagram.mmd",
            lang: "mermaid",
            content: defaultMermaidContent,
          },
        ];
      case "database":
        return [
          {
            name: "schema.sql",
            lang: "sql",
            content: defaultDatabaseContent,
          },
        ];
      case "editorjs":
        return [
          {
            name: "content.json",
            lang: "json",
            content: defaultEditorJsContent(),
          },
        ];
      case "circuit":
        return [
          {
            name: "circuit.json",
            lang: "json",
            content: defaultCircuitContent("Circuit"),
          },
        ];
      default:
        return [];
    }
  }
}
