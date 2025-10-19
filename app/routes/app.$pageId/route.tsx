import { PageService } from "~/.server/services/pageService";
import type { Route } from "../app.$pageId/+types/route";
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
  return (
    <div>
      {page.files.map((file) => (
        <div key={file.id}>
          <h2>{file.name}</h2>
          <pre>{file.content}</pre>
        </div>
      ))}
    </div>
  );
}
