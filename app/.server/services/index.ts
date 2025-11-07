import { FileService } from "./fileService";
import { FolderService } from "./folderService";
import { PageService } from "./pageService";
import { UserService } from "./userService";
import type { RepositoryLocator } from "../repos";

export class ServiceLocator {
  private _fileService?: FileService;
  private _folderService?: FolderService;
  private _pageService?: PageService;
  private _userService?: UserService;

  constructor(private repositoryContainer: RepositoryLocator) {}

  // Service getters with proper dependency injection
  get fileService(): FileService {
    return (this._fileService ??= new FileService(
      this.repositoryContainer.fileRepository,
      this.repositoryContainer.pageRepository,
      this.repositoryContainer.folderRepository,
    ));
  }

  get folderService(): FolderService {
    return (this._folderService ??= new FolderService(
      this.repositoryContainer.folderRepository,
      this.repositoryContainer.pageRepository,
      this.repositoryContainer.fileRepository,
      this.repositoryContainer.userRepository,
    ));
  }

  get pageService(): PageService {
    return (this._pageService ??= new PageService(
      this.repositoryContainer.pageRepository,
      this.repositoryContainer.fileRepository,
      this.repositoryContainer.folderRepository,
    ));
  }

  get userService(): UserService {
    return (this._userService ??= new UserService(
      this.repositoryContainer.userRepository,
      this.repositoryContainer.folderRepository,
    ));
  }
}
