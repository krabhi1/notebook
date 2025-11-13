import { useState, type PropsWithChildren } from "react";

import {
  ChevronRight,
  FolderOpen,
  Folder,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import PageList from "./PageList";
import { useFetcher, useParams } from "react-router";
import type { FolderWithPages } from "~/.server/repos/folderRepository";

interface FolderListProps {
  folders: FolderWithPages[];
}

export default function FolderList({ folders }: FolderListProps) {
  return (
    <div className="px-2 space-y-1 ">
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
}

type FolderItemProps = {
  folder: FolderWithPages;
};
function FolderItem({ folder }: FolderItemProps) {
  const { pageId } = useParams();
  const isActive = folder.pages.some((p) => p.id === pageId);
  const [isExpanded, setIsExpanded] = useState(isActive);

  const toggleFolder = (id: string) => {
    setIsExpanded((prev) => !prev);
  };

  const createPageFetch = useFetcher();
  const createPage = (folderId: string, type: string) => {
    const pageName = new Date().toLocaleTimeString();
    const formData = new FormData();
    formData.append("action", "createPage");
    formData.append("name", type + "-" + pageName);
    formData.append("folderId", folderId);
    formData.append("type", type);
    createPageFetch.submit(formData, { method: "post" });
  };
  return (
    <div key={folder.id}>
      {/* Folder Row */}
      <div
        onClick={() => toggleFolder(folder.id)}
        className="group flex items-center justify-between px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
      >
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          {isExpanded ? (
            <FolderOpen
              className={`w-4 h-4 ${isActive && "text-blue-500"} flex-shrink-0`}
            />
          ) : (
            <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <span className={`truncate text-sm ${isActive && "text-blue-500"}`}>
            {folder.name}
          </span>
        </div>
        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="New page in folder"
              >
                <Plus className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <DropdownMenuItem onSelect={() => createPage(folder.id, "web")}>
                Web
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => createPage(folder.id, "code")}>
                Code
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => createPage(folder.id, "mermaid")}
              >
                Mermaid
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => createPage(folder.id, "excalidraw")}
              >
                Excalidraw
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => createPage(folder.id, "database")}
              >
                Database
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <DropdownMenuItem>Rename folder</DropdownMenuItem>
              <DropdownMenuItem>Delete folder</DropdownMenuItem>
              <DropdownMenuItem>Add subfolder</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Folder Pages */}
      {isExpanded && <PageList pages={folder.pages} />}
    </div>
  );
}
