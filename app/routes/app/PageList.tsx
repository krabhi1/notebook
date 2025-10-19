import { MoreHorizontal, File, Edit, Trash2 } from "lucide-react";
import { NavLink } from "react-router";
import type { Page } from "~/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface PageListProps {
  pages: Page[];
}

export default function PageList({ pages }: PageListProps) {
  return (
    <div className="ml-5 space-y-1">
      {pages.map((page) => (
        <div
          key={page.id}
          className="group flex items-center justify-between px-2 py-1 text-sm rounded"
        >
          <NavLink
            to={`/app/${page.id}`}
            className={({ isActive, isPending }) =>
              `flex items-center space-x-2 flex-1 min-w-0 cursor-pointer ${
                isActive
                  ? "text-blue-700 dark:text-blue-300"
                  : isPending
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`
            }
          >
            <File className="w-4 h-4 flex-shrink-0" />
            <span className="truncate text-sm">{page.name}</span>
          </NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
