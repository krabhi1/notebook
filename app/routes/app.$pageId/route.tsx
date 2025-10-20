import { PageService } from "~/.server/services/pageService";
import type { Route } from "../app.$pageId/+types/route";
import CodeEditor from "~/components/CodeEditor";
import WebPage from "./web/WebPage";
import { useEffect } from "react";
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
  useEffect(() => {
    console.log("Loaded page:", page);
  }, [page]);
  return (
    <div className="flex-1 flex">
      <WebPage page={page} />
      {/*{page.files.map((file) => (
        <div key={file.id}>
          <h2>{file.name}</h2>
          <pre>{file.content}</pre>
        </div>
      ))}*/}
    </div>
  );
}
