import type { Route } from "../app.$pageId/+types/route";
import WebPage from "./web/WebPage";
import type { PageWithFiles } from "~/.server/repos/pageRepository";
import CodePage from "./code/CodePage";
import { FileSyncProvider } from "~/contexts/FileSyncProvider";
import { z } from "zod";

const saveFileSchema = z.object({
  action: z.literal("saveFile"),
  fileId: z.string().min(1, "File ID is required"),
  content: z.string(),
});

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
  // save File
  if (action === "saveFile") {
    const formDataObj = {
      action: formData.get("action"),
      fileId: formData.get("fileId"),
      content: formData.get("content"),
    };

    const validationResult = saveFileSchema.safeParse(formDataObj);

    if (!validationResult.success) {
      const errors = z.prettifyError(validationResult.error);
      return {
        ok: false,
        error: errors,
        content: formDataObj.content || "",
        version: 0,
      };
    }

    const { fileId, content } = validationResult.data;

    try {
      const updatedFile = await services.fileService.updateFileContent(
        fileId,
        content,
      );
      return {
        ok: true,
        content: updatedFile.content,
        version: updatedFile.version,
      };
    } catch (error) {
      console.error("Failed to save file:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to save file",
        content,
        version: 0,
      };
    }
  }

  return null;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  return (
    <FileSyncProvider key={page.id} page={page}>
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
