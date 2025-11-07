import { useState, useReducer, useEffect } from "react";
import { useFetcher, useRevalidator } from "react-router";
import type { PageWithFiles } from "~/.server/db/queries/page";
import type { File } from "~/.server/db/schema";
import { Editor } from "~/components/Editor";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useSonner } from "~/hooks/useSonner";
import { useNetworkStatus } from "~/hooks/useNetworkStatus";
import { useDataLossPrevention } from "~/hooks/useBeforeUnload";
import { useThrottledLocalStorage } from "~/hooks/useThrottle";

// Types for draft state management
type DraftAction =
  | { type: "UPDATE_DRAFT"; payload: { id: string; content: string } }
  | { type: "CLEAR_DRAFT"; payload: { id: string } }
  | { type: "CLEAR_ALL_DRAFTS" }
  | { type: "LOAD_DRAFTS"; payload: Record<string, string> }
  | { type: "MARK_SAVING"; payload: { id: string } }
  | { type: "MARK_ERROR"; payload: { id: string; error: string } }
  | { type: "RESET_FILE_STATE"; payload: { id: string; content: string } };

interface DraftFileState {
  content: string;
  isSaving?: boolean;
  error?: string;
  lastSaved?: Date;
}

type DraftState = Record<string, DraftFileState | string>; // Support both old string format and new object format

function draftsReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "UPDATE_DRAFT":
      const currentState = state[action.payload.id];
      return {
        ...state,
        [action.payload.id]:
          typeof currentState === "string"
            ? { content: action.payload.content }
            : {
                ...currentState,
                content: action.payload.content,
                error: undefined,
              },
      };
    case "CLEAR_DRAFT":
      const newState = { ...state };
      delete newState[action.payload.id];
      return newState;
    case "CLEAR_ALL_DRAFTS":
      return {};
    case "LOAD_DRAFTS":
      return { ...state, ...action.payload };
    case "MARK_SAVING":
      const savingState = state[action.payload.id];
      return {
        ...state,
        [action.payload.id]:
          typeof savingState === "string"
            ? { content: savingState, isSaving: true }
            : { ...savingState, isSaving: true, error: undefined },
      };
    case "MARK_ERROR":
      const errorState = state[action.payload.id];
      return {
        ...state,
        [action.payload.id]:
          typeof errorState === "string"
            ? {
                content: errorState,
                error: action.payload.error,
                isSaving: false,
              }
            : { ...errorState, error: action.payload.error, isSaving: false },
      };
    case "RESET_FILE_STATE":
      return {
        ...state,
        [action.payload.id]: {
          content: action.payload.content,
          lastSaved: new Date(),
          isSaving: false,
          error: undefined,
        },
      };
    default:
      return state;
  }
}

type SyncStatus = "Synced" | "Unsaved" | "Saving..." | "Error";

interface CodePageV2Props {
  page: PageWithFiles;
}

export default function CodePageV2({ page }: CodePageV2Props) {
  const [activeFileId, setActiveFileId] = useState(
    page.files.length > 0 ? page.files[0].id : "",
  );

  // Toast notifications
  const toast = useSonner();

  // Network status monitoring
  const { isOnline, isOffline, wasOffline } = useNetworkStatus();

  // Use useReducer for draft management
  const [drafts, dispatch] = useReducer(draftsReducer, {}, () => {
    // Initialize from localStorage if available (client-side only)
    if (typeof window === "undefined") {
      return {};
    }
    try {
      const localDrafts = localStorage.getItem(`drafts-${page.id}`);
      return localDrafts ? JSON.parse(localDrafts) : {};
    } catch (e) {
      return {};
    }
  });

  const { revalidate } = useRevalidator();

  // Handle reconnection sync
  useEffect(() => {
    if (wasOffline && isOnline) {
      const unsavedCount = Object.keys(drafts).length;
      if (unsavedCount > 0) {
        toast.info("Back online", {
          description: `Syncing ${unsavedCount} file(s) with unsaved changes...`,
          duration: 4000,
          icon: "🌐",
        });
      } else {
        toast.success("Connection restored", {
          description: "All files are up to date",
          duration: 2000,
        });
      }
      // The individual editors will handle their own sync via the wasOffline flag
    }
  }, [wasOffline, isOnline, toast, drafts]);

  // Show offline notification
  useEffect(() => {
    if (isOffline) {
      toast.warning("Offline mode", {
        description:
          "Changes will be saved locally and synced when you reconnect",
        duration: Infinity,
        id: "offline-status",
        icon: "📱",
      });
    } else {
      // Dismiss offline notification when back online
      toast.dismiss("offline-status");
    }
  }, [isOffline, toast]);

  // Persist drafts to localStorage with throttling for better performance
  useThrottledLocalStorage(
    `drafts-${page.id}`,
    Object.keys(drafts).length > 0 ? drafts : null,
    1000,
  );

  const activeFile = page.files.find((f) => f.id === activeFileId);

  // Helper function to get draft content
  const getDraftContent = (fileId: string, fallbackContent: string): string => {
    const draft = drafts[fileId];
    if (!draft) return fallbackContent;
    return typeof draft === "string" ? draft : draft.content;
  };

  // This is the content for the active editor
  // It's the draft version, or falls back to the server version
  const activeEditorContent = activeFile
    ? getDraftContent(activeFile.id, activeFile.content)
    : "";

  // Check if there are any unsaved changes
  const hasUnsavedChanges = Object.keys(drafts).some((fileId) => {
    const draft = drafts[fileId];
    const file = page.files.find((f) => f.id === fileId);
    if (!file || !draft) return false;

    const draftContent = typeof draft === "string" ? draft : draft.content;
    return draftContent !== file.content;
  });

  // Data loss prevention
  useDataLossPrevention({
    hasUnsavedChanges,
    message: `You have unsaved changes in ${Object.keys(drafts).length} file(s). Are you sure you want to leave?`,
  });

  return (
    <>
      <div className="flex-1 flex flex-col h-full">
        {/* Network status banner */}
        {isOffline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-sm text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📱</span>
                <div>
                  <span className="font-medium">Offline mode</span>
                  <div className="text-xs opacity-75">
                    {Object.keys(drafts).length > 0
                      ? `${Object.keys(drafts).length} file(s) with unsaved changes`
                      : "All changes saved locally"}
                  </div>
                </div>
              </div>
              <div className="text-xs opacity-75">
                Will sync when reconnected
              </div>
            </div>
          </div>
        )}

        <Tabs
          value={activeFileId}
          onValueChange={setActiveFileId}
          className="flex-1 flex flex-col h-full"
        >
          <ScrollArea className="w-full">
            <TabsList className="h-10 w-max">
              {page.files.map((file) => {
                const draft = drafts[file.id];
                const draftContent = draft
                  ? typeof draft === "string"
                    ? draft
                    : draft.content
                  : undefined;

                return (
                  <FileSyncStatus
                    key={file.id}
                    file={file}
                    draftContent={draftContent}
                    draft={draft}
                    dispatch={dispatch}
                    revalidate={revalidate}
                    toast={toast}
                  />
                );
              })}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="flex-1 flex flex-col min-h-0">
            {activeFile && (
              <TabsContent
                value={activeFile.id}
                className="flex-1 h-full data-[state=active]:flex data-[state=active]:flex-col m-0"
              >
                <Editor
                  // Using key is crucial for proper component lifecycle
                  key={activeFile.id}
                  fileId={activeFile.id}
                  fileName={activeFile.name}
                  fileContent={activeFile.content}
                  fileVersion={activeFile.version}
                  fileLang={activeFile.lang}
                  draftContent={activeEditorContent}
                  onDraftChange={(newContent) => {
                    dispatch({
                      type: "UPDATE_DRAFT",
                      payload: { id: activeFile.id, content: newContent },
                    });
                  }}
                  onSaveAttempt={(isOnline) => {
                    if (!isOnline) {
                      // Don't show repeated offline messages
                      console.log(
                        `Save attempt for ${activeFile.name} while offline`,
                      );
                    }
                  }}
                />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </>
  );
}

// Component to handle individual file sync status with its own fetcher
interface FileSyncStatusProps {
  file: File;
  draftContent?: string;
  draft?: DraftFileState | string;
  dispatch: React.Dispatch<DraftAction>;
  revalidate: () => void;
  toast: ReturnType<typeof useSonner>;
}

// Helper function to get error message from draft state
const getFileError = (
  draft: DraftFileState | string | undefined,
): string | undefined => {
  return draft && typeof draft === "object" ? draft.error : undefined;
};

function FileSyncStatus({
  file,
  draftContent,
  draft,
  dispatch,
  revalidate,
  toast,
}: FileSyncStatusProps) {
  const fileFetcher = useFetcher({ key: file.id });
  const fetcherData = fileFetcher.data as
    | {
        ok?: boolean;
        error?: string;
        revalidate?: boolean;
      }
    | undefined;

  // Enhanced state management with fetcher lifecycle
  useEffect(() => {
    if (fileFetcher.state === "submitting") {
      dispatch({ type: "MARK_SAVING", payload: { id: file.id } });
      // Show loading toast
      toast.loading(`Saving ${file.name}...`, {
        id: `save-${file.id}`,
        description: "Your changes are being synchronized",
      });
    } else if (fileFetcher.state === "idle") {
      if (fetcherData?.ok) {
        dispatch({
          type: "RESET_FILE_STATE",
          payload: { id: file.id, content: file.content },
        });
        toast.success(`${file.name} saved successfully`, {
          id: `save-${file.id}`,
          description: "All changes synchronized",
          duration: 2000,
        });
      } else if (fetcherData?.error) {
        dispatch({
          type: "MARK_ERROR",
          payload: { id: file.id, error: fetcherData.error },
        });
        if (fetcherData.error.includes("Conflict detected")) {
          toast.error(`Conflict in ${file.name}`, {
            id: `save-${file.id}`,
            description:
              "File was modified by another user. Refreshing content...",
            duration: 8000,
            action: {
              label: "Dismiss",
              onClick: () => toast.dismiss(`save-${file.id}`),
            },
          });
        } else {
          toast.error(`Failed to save ${file.name}`, {
            id: `save-${file.id}`,
            description: fetcherData.error,
            duration: 5000,
            action: {
              label: "Retry",
              onClick: () => {
                // Trigger a manual save retry
                const event = new Event("retry-save");
                window.dispatchEvent(event);
              },
            },
          });
        }
      }
    }
  }, [
    fileFetcher.state,
    fileFetcher.data,
    file.id,
    file.content,
    dispatch,
    fetcherData,
    toast,
  ]);

  let syncStatus: SyncStatus = "Synced";
  if (fetcherData?.error) {
    // Handle conflict resolution
    if (fetcherData.revalidate) {
      revalidate();
      toast.info("Content refreshed", {
        description: "Latest changes have been loaded",
        duration: 3000,
      });
    }
    syncStatus = "Error";
  } else if (fileFetcher.state === "submitting") {
    syncStatus = "Saving...";
  } else if (draftContent !== undefined && draftContent !== file.content) {
    syncStatus = "Unsaved";
  }

  // Show different status for offline unsaved changes
  const isNetworkAware = true; // We can access network status through context if needed

  const errorMessage = getFileError(draft);

  return (
    <TabsTrigger
      value={file.id}
      disabled={syncStatus === "Saving..."}
      className="relative"
    >
      <span>{file.name}</span>
      <span className="ml-2 text-xs opacity-70">({syncStatus})</span>
      {syncStatus === "Error" && (
        <span className="ml-1" title={errorMessage || "Save failed"}>
          ⚠️
        </span>
      )}
      {syncStatus === "Unsaved" && (
        <span
          className="ml-1 w-2 h-2 bg-orange-500 rounded-full"
          title="Unsaved changes"
        />
      )}
      {syncStatus === "Saving..." && (
        <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      )}
    </TabsTrigger>
  );
}
