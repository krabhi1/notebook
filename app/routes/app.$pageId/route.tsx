import { PageService } from "~/.server/services/pageService";
import type { Route } from "../app.$pageId/+types/route";
import CodeEditor from "~/components/CodeEditor";
export async function loader({
  request,
  params: { pageId },
}: Route.LoaderArgs) {
  const page = await PageService.getPageWithFiles(pageId);
  if (!page) {
    throw new Response("Page Not Found", { status: 404 });
  }
  return { page };
}
export default function Page({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  const htmlFile = page.files.find((file) => file.lang === "html");
  return (
    <div className="flex-1">
      <CodeEditor
        language="html"
        value={htmlFile?.content || ""}
        loadingText="Loading..."
        theme="light"
      />
      {/*{page.files.map((file) => (
        <div key={file.id}>
          <h2>{file.name}</h2>
          <pre>{file.content}</pre>
        </div>
      ))}*/}
    </div>
  );
}
