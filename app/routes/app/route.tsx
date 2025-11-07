import { Outlet } from "react-router";
import { Plus } from "lucide-react";
import FolderList from "~/routes/app/FolderList";
import { useFetcher } from "react-router";
import type { Route } from "../app/+types/route";
import type { Page } from "~/.server/db/schema";
const userId = "hQHg8eOjyiRYcEfJhJrLMReJmFQEaWrk";
export async function loader({ context: { services } }: Route.LoaderArgs) {
  console.log("Loader called for /app route");
  const folders = await services.folderService.getFoldersWithPages(userId);
  return { folders };
}
export async function action({
  request,
  context: { services },
}: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  if (action === "createFolder") {
    const name = formData.get("name") as string;
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Folder name is required");
    }
    await services.folderService.createFolder({
      userId,
      name: name.trim(),
    });
  }
  if (action == "createPage") {
    const folderId = formData.get("folderId") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    if (typeof folderId !== "string" || folderId.trim() === "") {
      throw new Error("Folder ID is required");
    }
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Page name is required");
    }
    if (typeof type !== "string" || type.trim() === "") {
      throw new Error("Page type is required");
    }
    await services.pageService.createPageWithDefaultFiles(
      folderId,
      name,
      type as Page["type"],
    );
  }
  // save File
  if (action === "saveFile") {
    const fileId = formData.get("fileId") as string;
    const content = formData.get("content") as string;
    if (typeof fileId !== "string" || fileId.trim() === "") {
      throw new Error("File ID is required");
    }
    if (typeof content !== "string") {
      throw new Error("Content is required");
    }
    await services.fileService.updateFileContent(fileId, content);
  }
  return null;
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
      {/*<header className="h-10 shrink-0 border-b ">Header</header>*/}
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

        <main className="flex-1 overflow-auto flex">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
