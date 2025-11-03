import { PageService } from "~/.server/services/pageService";
import type { Route } from "../app.$pageId/+types/route";
import WebPage from "./web/WebPage";
import { useEffect } from "react";
import type { PageWithFiles } from "~/.server/db/queries/page";
import CodePage from "./code/CodePage";
import { FileService } from "~/.server/services/fileService";
import type { ShouldRevalidateFunction } from "react-router";
export async function loader({
  request,
  params: { pageId },
}: Route.LoaderArgs) {
  console.log("Loader called for /app/:pageId route with pageId:", pageId);
  const page = await PageService.getPageWithFiles(pageId);
  if (!page) {
    throw new Response("Page Not Found", { status: 404 });
  }
  return { page };
}
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "saveFile") {
    const fileId = formData.get("fileId") as string;
    const content = formData.get("content") as string;
    if (typeof fileId !== "string" || fileId.trim() === "") {
      throw new Error("File ID is required");
    }
    if (typeof content !== "string") {
      throw new Error("Content is required");
    }
    await FileService.updateFileContent(fileId, content);
  }
  return null;
}
export const shouldRevalidate: ShouldRevalidateFunction = ({ formData }) => {
  if (formData?.get("action") === "saveFile") {
    return false;
  }

  return true;
};

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
