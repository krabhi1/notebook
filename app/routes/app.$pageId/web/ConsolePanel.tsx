import { twMerge } from "tailwind-merge";
import type { ConsoleLog } from "./utils";

const ConsolePanel = ({
  consoleLogs,
  clearConsole,
  autoClearOnEdit,
  setAutoClearOnEdit,
  formatConsoleArgs,
  getLogStyle,
}: {
  consoleLogs: ConsoleLog[];
  clearConsole: () => void;
  autoClearOnEdit: boolean;
  setAutoClearOnEdit: (value: boolean) => void;
  formatConsoleArgs: (args: any[]) => string;
  getLogStyle: (type: string) => { icon: string; color: string };
}) => (
  <div className="h-full flex flex-col bg-black dark:bg-gray-900">
    <div className="h-8 shrink-0 bg-gray-900 dark:bg-gray-800 border-b border-gray-800 dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <span className="text-white text-sm font-medium">Console</span>
        <span className="text-gray-400 text-xs">
          ({consoleLogs.length} {consoleLogs.length === 1 ? "log" : "logs"})
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setAutoClearOnEdit(!autoClearOnEdit)}
          className={twMerge(
            "text-xs px-2 py-1 rounded transition-colors",
            autoClearOnEdit
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-gray-400 hover:text-white hover:bg-gray-700",
          )}
          title={
            autoClearOnEdit
              ? "Disable auto-clear on edit"
              : "Enable auto-clear on edit"
          }
        >
          Auto
        </button>
        <button
          onClick={clearConsole}
          className={twMerge(
            "text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-700",
          )}
          title="Clear console"
        >
          Clear
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-auto font-mono text-sm">
      {consoleLogs.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400 p-4 italic">
          Console output will appear here
        </div>
      ) : (
        consoleLogs.map((log) => {
          const style = getLogStyle(log.type);
          return (
            <div
              key={log.id}
              className={twMerge(
                "flex items-start px-4 py-2 border-b border-gray-900 dark:border-gray-800 hover:bg-gray-900 dark:hover:bg-gray-800",
              )}
            >
              <span
                className={twMerge("flex-shrink-0 w-4 font-bold", style.color)}
              >
                {style.icon}
              </span>
              <span
                className={twMerge(
                  "flex-1 ml-2 whitespace-pre-wrap break-words",
                  style.color,
                )}
              >
                {log.content}
              </span>
              <div className="flex items-center space-x-2 ml-2">
                {log.count > 1 && (
                  <span className="bg-gray-700 dark:bg-gray-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {log.count}
                  </span>
                )}
                <span className="flex-shrink-0 text-xs text-gray-600 dark:text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString().slice(0, -3)}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);
export default ConsolePanel;
