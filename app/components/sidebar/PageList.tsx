import { MoreHorizontal, File } from "lucide-react";
import { Link, NavLink } from "react-router";
import type { Page } from "~/db/schema";

interface PageListProps {
  pages: Page[];
}

export default function PageList({ pages }: PageListProps) {
  return (
    <div className="ml-5 space-y-1">
      {pages.map((page) => (
        <NavLink
          to={`page/${page.id}`}
          key={page.id}
          className={({ isActive, isPending }) =>
            `group flex items-center justify-between px-2 py-1 text-sm rounded cursor-pointer ${
              isActive
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : isPending
                  ? "text-gray-600 dark:text-gray-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`
          }
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <File className="w-4 h-4 flex-shrink-0" />
            <span className="truncate text-sm">{page.name}</span>
            {/*{(page as any).isPublic && (
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
              )}*/}
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </NavLink>
      ))}
    </div>
  );
}
