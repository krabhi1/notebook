import { useState } from "react";
import { useFetcher } from "react-router";
import { AlertTriangle, GitMerge, FileX, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useSonner } from "~/hooks/useSonner";
import {
  createTextDiff,
  getDiffSummary,
  getChangedLines,
  canAutoMerge,
  attemptThreeWayMerge,
} from "~/lib/textDiff";

export interface ConflictInfo {
  expectedVersion: number;
  currentVersion: number;
  currentContent: string;
  hasConflict: boolean;
  lastModified: Date;
}

export interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileId: string;
  yourContent: string;
  conflictInfo: ConflictInfo;
  onResolved: (resolvedContent: string, newVersion: number) => void;
}

type ResolutionStrategy = "yours" | "theirs" | "manual";

export function ConflictResolutionDialog({
  isOpen,
  onClose,
  fileName,
  fileId,
  yourContent,
  conflictInfo,
  onResolved,
}: ConflictResolutionDialogProps) {
  const [selectedStrategy, setSelectedStrategy] =
    useState<ResolutionStrategy>("yours");
  const [manualContent, setManualContent] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const fetcher = useFetcher();
  const toast = useSonner();

  // Check if automatic merge is possible
  const canMergeAutomatically = canAutoMerge(
    yourContent,
    conflictInfo.currentContent,
  );
  const autoMergeResult = canMergeAutomatically
    ? attemptThreeWayMerge(
        conflictInfo.currentContent,
        yourContent,
        conflictInfo.currentContent,
      )
    : null;

  const handleResolve = async () => {
    let finalContent: string;

    switch (selectedStrategy) {
      case "yours":
        finalContent = yourContent;
        break;
      case "theirs":
        finalContent = conflictInfo.currentContent;
        break;
      case "manual":
        finalContent = manualContent;
        break;
      default:
        return;
    }

    setIsResolving(true);

    try {
      fetcher.submit(
        {
          fileId: fileId,
          content: finalContent,
          version: conflictInfo.currentVersion.toString(),
          resolution: "force-overwrite",
          intent: "resolve-conflict",
        },
        { method: "POST" },
      );

      // Handle the response
      if (fetcher.data?.ok) {
        toast.success(`Conflict resolved for ${fileName}`, {
          description: `Using ${selectedStrategy === "yours" ? "your version" : selectedStrategy === "theirs" ? "their version" : "manual merge"}`,
        });
        onResolved(finalContent, fetcher.data.savedFile.version);
        onClose();
      } else if (fetcher.data?.error) {
        toast.error("Failed to resolve conflict", {
          description: fetcher.data.error,
        });
      }
    } catch (error) {
      toast.error("Failed to resolve conflict", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const diffSummary = getDiffSummary(yourContent, conflictInfo.currentContent);
  const changedLines = getChangedLines(
    yourContent,
    conflictInfo.currentContent,
    10,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Merge Conflict in {fileName}
          </DialogTitle>
          <DialogDescription>
            This file was modified by another user while you were editing it.
            Choose how to resolve the conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <RefreshCw className="h-4 w-4" />
              <span>
                Conflict between version {conflictInfo.expectedVersion} (yours)
                and version {conflictInfo.currentVersion} (current)
              </span>
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
              Last modified: {formatTimestamp(conflictInfo.lastModified)}
            </div>
          </div>

          <Tabs
            value={selectedStrategy}
            onValueChange={(value) =>
              setSelectedStrategy(value as ResolutionStrategy)
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="yours" className="flex items-center gap-2">
                <FileX className="h-4 w-4" />
                Keep Yours
              </TabsTrigger>
              <TabsTrigger value="theirs" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Use Theirs
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <GitMerge className="h-4 w-4" />
                Manual Merge
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-4">
              {canMergeAutomatically && autoMergeResult?.success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200 mb-2">
                    <GitMerge className="h-4 w-4" />
                    <span className="font-medium">Auto-merge suggested</span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-300 mb-2">
                    The changes don't conflict and can be merged automatically.
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                    onClick={() => {
                      setSelectedStrategy("manual");
                      setManualContent(autoMergeResult.result || "");
                    }}
                  >
                    Use auto-merge
                  </Button>
                </div>
              )}

              {diffSummary.hasChanges && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Changes Summary:</h4>
                    <div className="text-xs text-gray-500">
                      {diffSummary.totalChanges} change
                      {diffSummary.totalChanges !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs mb-3">
                    {diffSummary.linesAdded > 0 && (
                      <span className="text-green-600 dark:text-green-400">
                        +{diffSummary.linesAdded} added
                      </span>
                    )}
                    {diffSummary.linesRemoved > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        -{diffSummary.linesRemoved} removed
                      </span>
                    )}
                    {diffSummary.linesModified > 0 && (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        ~{diffSummary.linesModified} modified
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-xs">
                    {changedLines.map((line, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-gray-500 min-w-[3rem]">
                          L{line.lineNumber}:
                        </span>
                        <div className="flex-1">
                          {line.type === "added" && (
                            <div className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1 rounded">
                              + {line.content}
                            </div>
                          )}
                          {line.type === "removed" && (
                            <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1 rounded">
                              - {line.content}
                            </div>
                          )}
                          {line.type === "modified" && (
                            <div className="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-1 rounded">
                              ~ {line.content}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {changedLines.length === 10 &&
                      diffSummary.totalChanges > 10 && (
                        <div className="text-gray-500 text-center">
                          ... and {diffSummary.totalChanges - 10} more changes
                        </div>
                      )}
                  </div>
                </div>
              )}

              <TabsContent value="yours" className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Keep your version and discard the other user's changes.
                </div>
                <ScrollArea className="h-48 w-full border rounded-md p-2 bg-green-50 dark:bg-green-900/10">
                  <pre className="text-xs">{yourContent}</pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="theirs" className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Use the other user's version and discard your changes.
                </div>
                <ScrollArea className="h-48 w-full border rounded-md p-2 bg-blue-50 dark:bg-blue-900/10">
                  <pre className="text-xs">{conflictInfo.currentContent}</pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="manual" className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Manually edit the content to combine both versions.
                </div>
                <textarea
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="Edit the content to resolve conflicts manually..."
                  className="w-full h-48 p-2 border rounded-md text-xs font-mono resize-none"
                  style={{ fontFamily: "monospace" }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setManualContent(yourContent)}
                  >
                    Start with yours
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setManualContent(conflictInfo.currentContent)
                    }
                  >
                    Start with theirs
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isResolving}>
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={
              isResolving ||
              (selectedStrategy === "manual" && !manualContent.trim())
            }
          >
            {isResolving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <GitMerge className="h-4 w-4 mr-2" />
                Resolve Conflict
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
