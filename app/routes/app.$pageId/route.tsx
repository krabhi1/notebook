import { PageService } from "~/.server/services/pageService";
import type { Route } from "../app.$pageId/+types/route";
import WebPage from "./web/WebPage";
import { useEffect } from "react";
import type { PageWithFiles } from "~/.server/db/queries/page";
import CodePage from "./code/CodePage";
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
      <PageView page={page} />
    </div>
  );
}
function PageView({ page }: { page: PageWithFiles }) {
  if (page.type == "web") {
    return <WebPage page={page} />;
  }
  if (page.type == "code") {
    return <CodePage page={page} />;
  }
  return <div>Unsupported page type: {page.type}</div>;
}
