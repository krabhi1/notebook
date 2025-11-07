import type { File } from "~/.server/db/schema";
import type { PageWithFiles } from "~/.server/repos/pageRepository";
import CodeEditor from "~/components/CodeEditor";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useFile } from "~/lib/hooks";
export default function CodePage({ page }: { page: PageWithFiles }) {
  const defaultValue = page.files.length > 0 ? page.files[0].id : "";

  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs defaultValue={defaultValue} className="flex-1 flex flex-col h-full">
        <ScrollArea className="w-full">
          <TabsList className="h-10 w-max">
            {page.files.map((file) => (
              <TabsTrigger key={file.id} value={file.id}>
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex-1 flex flex-col min-h-0">
          {page.files.map((file) => (
            <FileTab key={file.id} file={file} />
          ))}
        </div>
      </Tabs>
    </div>
  );
}
function FileTab({ file }: { file: File }) {
  const fileState = useFile(file);

  return (
    <TabsContent
      value={file.id}
      className="flex-1 h-full data-[state=active]:flex data-[state=active]:flex-col"
    >
      <CodeEditor
        language={file.lang}
        defaultValue={fileState.value}
        onChange={(val) => fileState.updateValue(val || "")}
        path={fileState.path}
      />
    </TabsContent>
  );
}
