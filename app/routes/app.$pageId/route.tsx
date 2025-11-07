import type { Route } from "../app.$pageId/+types/route";
import WebPage from "./web/WebPage";
import { useEffect } from "react";
import CodePageV2 from "./code/CodePageV2";
import type { ShouldRevalidateFunction } from "react-router";
import type { PageWithFiles } from "~/.server/repos/pageRepository";
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
  const intent = formData.get("intent");
  const fileService = services.fileService;

  if (intent === "save-file") {
    const fileId = formData.get("fileId") as string;
    const content = formData.get("content") as string;
    const version = formData.get("version") as string;

    if (typeof fileId !== "string" || fileId.trim() === "") {
      throw new Error("File ID is required");
    }
    if (typeof content !== "string") {
      throw new Error("Content is required");
    }
    if (typeof version !== "string") {
      throw new Error("Version is required");
    }

    const expectedVersion = parseInt(version, 10);
    if (isNaN(expectedVersion)) {
      throw new Error("Invalid version number");
    }

    try {
      const updatedFile = await fileService.updateFileContentWithVersion(
        fileId,
        content,
        expectedVersion,
      );

      return {
        ok: true,
        savedFile: {
          id: fileId,
          content: updatedFile.content,
          version: updatedFile.version,
        },
      };
    } catch (error) {
      // if (
      //   error instanceof Error &&
      //   error.message.includes("Conflict detected")
      // ) {
      //   // Get detailed conflict information
      //   const conflictInfo = await fileService.getConflictInfo(
      //     fileId,
      //     expectedVersion,
      //   );

      //   return {
      //     ok: false,
      //     error:
      //       "Conflict detected. The file has been updated by another source.",
      //     conflictInfo: {
      //       expectedVersion: conflictInfo.expectedVersion,
      //       currentVersion: conflictInfo.currentVersion,
      //       currentContent: conflictInfo.currentFile?.content,
      //       hasConflict: conflictInfo.hasConflict,
      //       lastModified: conflictInfo.currentFile?.updatedAt,
      //     },
      //     revalidate: true,
      //   };
      // }
      throw error;
    }
  }

  if (intent === "resolve-conflict") {
    const fileId = formData.get("fileId") as string;
    const content = formData.get("content") as string;
    const version = formData.get("version") as string;
    const resolution = formData.get("resolution") as string;

    if (typeof fileId !== "string" || fileId.trim() === "") {
      throw new Error("File ID is required");
    }
    if (typeof content !== "string") {
      throw new Error("Content is required");
    }
    if (typeof version !== "string") {
      throw new Error("Version is required");
    }
    if (typeof resolution !== "string") {
      throw new Error("Resolution strategy is required");
    }

    const expectedVersion = parseInt(version, 10);
    if (isNaN(expectedVersion)) {
      throw new Error("Invalid version number");
    }

    //   try {
    //     const updatedFile =
    //       await fileService.updateFileContentWithConflictResolution(
    //         fileId,
    //         content,
    //         expectedVersion,
    //         resolution as "force-overwrite" | "merge-attempt",
    //       );

    //     return {
    //       ok: true,
    //       resolved: true,
    //       savedFile: {
    //         id: fileId,
    //         content: updatedFile.content,
    //         version: updatedFile.version,
    //       },
    //       resolutionStrategy: resolution,
    //     };
    //   } catch (error) {
    //     return {
    //       ok: false,
    //       error:
    //         error instanceof Error ? error.message : "Failed to resolve conflict",
    //     };
    //   }
  }
  // Legacy support for old saveFile action
  if (formData.get("action") === "saveFile") {
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
    return <CodePageV2 page={page} />;
  }
  return <div>Unsupported page type: {page.type}</div>;
}
