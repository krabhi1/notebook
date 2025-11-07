import type { DrizzleClient } from "../db";
import { FileRepository } from "./fileRepository";
import { FolderRepository } from "./folderRepository";
import { PageRepository } from "./pageRepository";
import { UserRepository } from "./userRepository";

export class RepositoryLocator {
  private _fileRepository?: FileRepository;
  private _folderRepository?: FolderRepository;
  private _pageRepository?: PageRepository;
  private _userRepository?: UserRepository;

  constructor(private db: DrizzleClient) {}

  get fileRepository(): FileRepository {
    return (this._fileRepository ??= new FileRepository(this.db));
  }

  get folderRepository(): FolderRepository {
    return (this._folderRepository ??= new FolderRepository(this.db));
  }

  get pageRepository(): PageRepository {
    return (this._pageRepository ??= new PageRepository(this.db));
  }

  get userRepository(): UserRepository {
    return (this._userRepository ??= new UserRepository(this.db));
  }
}
