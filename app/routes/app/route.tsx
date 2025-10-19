import { Outlet } from "react-router";
import { FolderService } from "~/db/services/folderService";
import { MoreHorizontal, Plus } from "lucide-react";
import FolderList from "~/routes/app/FolderList";
import { useFetcher } from "react-router";
import type { Route } from "../app/+types/route";

const userId = "abhi";
export async function loader({ request }: Route.LoaderArgs) {
  const folders = await FolderService.getFoldersWithPages(userId);
  return { folders };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { folders } = loaderData;
  const createFolderFetcher = useFetcher();
  function handleCreateFolder() {
    const folderName = new Date().toLocaleTimeString();
    const formData = new FormData();
    formData.append("action", "createFolder");
    formData.append("name", folderName);
    createFolderFetcher.submit(formData, { method: "post" });
  }
  return (
    <div className="h-screen flex flex-col">
      <header className="h-10 shrink-0 border-b ">Header</header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="shrink-0  border-r overflow-auto">
          <div className="flex-1 overflow-y-auto">
            {/* Designs Section Header */}
            <div className="group flex items-center justify-between px-1 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 rounded mx-2">
              <span>Pages</span>
              <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="New Folder"
                  onClick={handleCreateFolder}
                >
                  <Plus className="w-4 h-4" />
                </button>
                {/*<button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>*/}
              </div>
            </div>
            <FolderList folders={folders} />
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
