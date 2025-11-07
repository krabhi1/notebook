import { useFetcher } from "react-router";
import { useDebounceEffect } from "~/hooks/useDebounceEffect";
import { useNetworkStatus } from "~/hooks/useNetworkStatus";
import { useSonner } from "~/hooks/useSonner";
import CodeEditor from "./CodeEditor";

interface EditorProps {
  fileId: string;
  fileName: string;
  fileContent: string;
  fileVersion: number;
  fileLang: string;
  draftContent: string;
  onDraftChange: (newContent: string) => void;
  onSaveAttempt?: (isOnline: boolean) => void;
}

export function Editor({
  fileId,
  fileName,
  fileContent,
  fileVersion,
  fileLang,
  draftContent,
  onDraftChange,
  onSaveAttempt,
}: EditorProps) {
  // Use keyed fetcher for this specific file
  const fetcher = useFetcher({ key: fileId });

  // Network status monitoring
  const { isOnline, wasOffline } = useNetworkStatus();

  // Toast notifications
  const toast = useSonner();

  // Debounced auto-save effect with network awareness
  useDebounceEffect(
    () => {
      // Don't submit if the content hasn't changed from the server
      if (draftContent === fileContent) {
        return;
      }

      // Don't submit if we are already submitting
      if (fetcher.state !== "idle") {
        return;
      }

      // Notify parent about save attempt
      onSaveAttempt?.(isOnline);

      // Only submit if online
      if (!isOnline) {
        console.log(`[Editor] Skipping save for ${fileName} - offline`);
        // Show subtle feedback about offline saving
        onSaveAttempt?.(false);
        return;
      }

      console.log(`[Editor] Auto-saving ${fileName}...`);
      onSaveAttempt?.(true);
      fetcher.submit(
        {
          fileId: fileId,
          content: draftContent,
          version: fileVersion.toString(),
          intent: "save-file",
        },
        {
          method: "POST",
        },
      );
    },
    [
      draftContent,
      fileId,
      fileContent,
      fileVersion,
      fetcher,
      isOnline,
      fileName,
      onSaveAttempt,
    ],
    1500, // 1.5 second delay
  );

  // Auto-sync when coming back online
  useDebounceEffect(
    () => {
      if (
        wasOffline &&
        isOnline &&
        draftContent !== fileContent &&
        fetcher.state === "idle"
      ) {
        console.log(`[Editor] Back online - syncing ${fileName}...`);
        toast.info(`Syncing ${fileName}`, {
          description: "Uploading offline changes...",
          duration: 3000,
        });
        fetcher.submit(
          {
            fileId: fileId,
            content: draftContent,
            version: fileVersion.toString(),
            intent: "save-file",
          },
          {
            method: "POST",
          },
        );
      }
    },
    [
      wasOffline,
      isOnline,
      draftContent,
      fileContent,
      fetcher,
      fileId,
      fileVersion,
      fileName,
      toast,
    ],
    500, // Shorter delay for reconnect sync
  );

  return (
    <div className="flex-1 h-full relative">
      {!isOnline && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs shadow-sm">
          📱 Offline - saved locally
        </div>
      )}
      <CodeEditor
        language={fileLang}
        value={draftContent}
        onChange={(value) => onDraftChange(value || "")}
        path={`${fileId}/${fileName}`}
      />
    </div>
  );
}
