import type { PageWithFiles } from "~/.server/db/queries/page";
export default function CodePage({ page }: { page: PageWithFiles }) {
  return <div>Code Page for {page.name}</div>;
}
