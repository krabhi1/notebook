import { twMerge } from "tailwind-merge";
import type { EditorTab } from "./utils";

const EditorTabBar = ({
  activeTab,
  setActiveTab,
  setIsConsoleVisible,
  isConsoleVisible,
  formatCode,
}: {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  setIsConsoleVisible: (visible: boolean) => void;
  isConsoleVisible: boolean;
  formatCode: () => void;
}) => {
  const tabs = [
    { id: "html" as EditorTab, label: "HTML", icon: "📄" },
    { id: "css" as EditorTab, label: "CSS", icon: "🎨" },
    { id: "js" as EditorTab, label: "JS", icon: "⚡" },
  ];

  return (
    <div className="h-8 shrink-0 bg-slate-200 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600 flex items-center justify-between">
      <div className="flex h-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={twMerge(
              "px-4 h-full flex items-center space-x-2 text-sm font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-white dark:bg-gray-800 text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-gray-600",
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex h-full">
        <button
          onClick={formatCode}
          className={twMerge(
            "px-3 h-full flex items-center space-x-1 text-sm font-medium border-l border-slate-200 dark:border-gray-600",
            "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-600",
          )}
          title="Format Code (Ctrl+Shift+F)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Format</span>
        </button>

        <button
          onClick={() => setIsConsoleVisible(!isConsoleVisible)}
          className={twMerge(
            "px-3 h-full flex items-center space-x-1 text-sm font-medium border-l border-slate-200 dark:border-gray-600",
            "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-600",
          )}
          title={isConsoleVisible ? "Hide Console" : "Show Console"}
        >
          <span>🖥️</span>
          <span>Console</span>
        </button>
      </div>
    </div>
  );
};

export default EditorTabBar;
