import { RotateCcwIcon, RotateCwIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { iframeHtml } from "./utils";

const PreviewPanel = ({
  iframeRef,
  handleIframeLoad,
  isUpdatingPreview,
  previewMode,
  setPreviewMode,
  onReload,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  handleIframeLoad: () => void;
  isUpdatingPreview: boolean;
  previewMode: "mobile" | "tablet" | "desktop" | "full";
  setPreviewMode: (mode: "mobile" | "tablet" | "desktop" | "full") => void;
  onReload: () => void;
}) => (
  <div className="h-full flex flex-col">
    <div className="h-8 shrink-0 bg-slate-100 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600 flex items-center px-4">
      <span className="text-slate-600 dark:text-gray-300 text-sm font-medium">
        Preview
      </span>
      <button
        onClick={onReload}
        className={`ml-1 p-1 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-600 rounded transition-colors ${isUpdatingPreview && "animate-spin"}`}
        title="Reload Preview (Ctrl+R)"
      >
        <RotateCwIcon size={"16px"} />
      </button>
      <div className="ml-auto flex items-center">
        <div className="flex bg-white   dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
          <button
            onClick={() => setPreviewMode("mobile")}
            className={twMerge(
              "px-3 py-1.5 flex items-center justify-center transition-colors border-r border-gray-200 dark:border-gray-600",
              previewMode === "mobile"
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
            )}
            title="Mobile (375px)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </button>
          <button
            onClick={() => setPreviewMode("tablet")}
            className={twMerge(
              "px-3 py-1.5 flex items-center justify-center transition-colors border-r border-gray-200 dark:border-gray-600",
              previewMode === "tablet"
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
            )}
            title="Tablet (768px)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          <button
            onClick={() => setPreviewMode("desktop")}
            className={twMerge(
              "px-3 py-1.5 flex items-center justify-center transition-colors border-r border-gray-200 dark:border-gray-600",
              previewMode === "desktop"
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
            )}
            title="Desktop (1024px)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>
          <button
            onClick={() => setPreviewMode("full")}
            className={twMerge(
              "px-3 py-1.5 flex items-center justify-center transition-colors",
              previewMode === "full"
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
            )}
            title="Full Width"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 min-w-0 min-h-0 overflow-auto">
      <div
        className="relative flex h-full"
        style={
          previewMode !== "full"
            ? {
                width:
                  previewMode === "mobile"
                    ? 375
                    : previewMode === "tablet"
                      ? 768
                      : 1024,
                margin: "0 auto",
              }
            : {}
        }
      >
        <iframe
          ref={iframeRef}
          srcDoc={iframeHtml}
          onLoad={handleIframeLoad}
          className="w-full border-0 h-full"
          title="Web UI Preview"
          sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
        />
      </div>
    </div>
  </div>
);

export default PreviewPanel;
