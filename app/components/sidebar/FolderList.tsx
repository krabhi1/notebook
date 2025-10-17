import { useState } from "react";
import type { FolderWithPages } from "~/db/queries/folder";
import {
  ChevronRight,
  FolderOpen,
  Folder,
  Plus,
  MoreHorizontal,
  File,
} from "lucide-react";
import PageList from "./PageList";
import { useFetcher } from "react-router";

interface FolderListProps {
  folders: FolderWithPages[];
}

export default function FolderList({ folders }: FolderListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const createPageFetch = useFetcher();

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  const createPage = (folderId: string) => {
    const pageName = new Date().toLocaleTimeString();
    const formData = new FormData();
    formData.append("action", "createPage");
    formData.append("name", pageName);
    formData.append("folderId", folderId);
    formData.append("type", "code");
    createPageFetch.submit(formData, { method: "post" });
  };

  return (
    <div className="px-2 space-y-1 ">
      {/* Folders */}
      {folders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id);

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
                  <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span className="truncate text-sm">{folder.name}</span>
              </div>
              <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createPage(folder.id);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="New page in folder"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Folder Pages */}
            {isExpanded && <PageList pages={folder.pages} />}
          </div>
        );
      })}
    </div>
  );
}
