import { useEffect } from "react";
import { useFetcher, type FetcherWithComponents } from "react-router";
import type { File } from "~/.server/db/schema";
import CodeEditor from "~/components/CodeEditor";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { FileFetcher, useFilesSync } from "~/lib/contexts/FileSyncProvider";

export default function CodePage() {
  const filesSync = useFilesSync();
  const activeFile = filesSync.activeFile;

  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs
        value={activeFile?.id || ""}
        className="flex-1 flex flex-col h-full"
        onValueChange={(val) => filesSync.setActiveTab(val)}
      >
        <ScrollArea className="w-full">
          <TabsList className="h-10 w-max">
            {filesSync.files.map((file) => (
              <TabsTrigger key={file.id} value={file.id}>
                {file.name}-{file.status}
                <FileFetcher id={file.id} />
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex-1 flex flex-col min-h-0">
          {activeFile && (
            <CodeEditor
              language={activeFile.lang}
              defaultValue={filesSync.activeEditorContent}
              onChange={(val) => {
                filesSync.updateValue(activeFile.id, val || "");
              }}
              path={activeFile.path}
            />
          )}
          {!activeFile && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No file selected
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
