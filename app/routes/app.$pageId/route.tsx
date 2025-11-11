import type { Route } from "../app.$pageId/+types/route";
import WebPage from "./web/WebPage";
import { useEffect } from "react";
import CodePageV2 from "./code/CodePageV2";
import type { ShouldRevalidateFunction } from "react-router";
import type { PageWithFiles } from "~/.server/repos/pageRepository";
import CodePage from "./code/CodePage";
import { FileSyncProvider } from "~/contexts/FileSyncProvider";
import { sleep } from "~/lib/utils";
export async function loader({
  params: { pageId },
  context: { services },
}: Route.LoaderArgs) {
  console.log("Loader called for /app/:pageId route with pageId:", pageId);
  const page = await services.pageService.getPageWithFiles(pageId);
  if (!page) {
    throw new Response("Page Not Found", { status: 404 });
  }
  return { page };
}
export async function action({
  request,
  context: { services },
}: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const fileService = services.fileService;
  if (action === "saveFile") {
    const fileId = formData.get("fileId") as string;
    const content = formData.get("content") as string;
    if (typeof fileId !== "string" || fileId.trim() === "") {
      throw new Error("File ID is required");
    }
    if (typeof content !== "string") {
      throw new Error("Content is required");
    }
    await fileService.updateFileContent(fileId, content);
  }

  return null;
}
export const shouldRevalidate: ShouldRevalidateFunction = ({ formData }) => {
  // if (formData?.get("action") === "saveFile") {
  //   return false;
  // }

  return true;
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  useEffect(() => {
    console.log("Loaded page:", page);
  }, [page]);
  return (
    <FileSyncProvider page={page}>
      <div className="flex-1 flex">
        <PageView page={page} />
      </div>
    </FileSyncProvider>
  );
}
function PageView({ page }: { page: PageWithFiles }) {
  if (page.type == "web") {
    return <WebPage page={page} />;
  }
  if (page.type == "code") {
    return <CodePage />;
  }
  return <div>Unsupported page type: {page.type}</div>;
}
