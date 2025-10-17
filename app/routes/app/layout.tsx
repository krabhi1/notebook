import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { FolderService } from "~/db/services/folderService";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = "abhi";
  const folders = await FolderService.getFoldersWithPages(userId);
  return { folders };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { folders } = loaderData;
  console.log(folders);
  return (
    <div className="h-screen flex flex-col">
      <header className="h-10 shrink-0 border-b bg-gray-100">Header</header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 bg-gray-100 border-r overflow-auto"></aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
