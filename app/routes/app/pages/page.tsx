import type { Route } from "./+types/page";
export async function loader({
  request,
  params: { pageId },
}: Route.LoaderArgs) {
  return { pageId };
}
export default function Page({ loaderData }: Route.ComponentProps) {
  const { pageId } = loaderData;
  return <div>Page id {pageId}</div>;
}
