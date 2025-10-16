import { Button } from "~/components/ui/button";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "WebBook" }, { name: "description", content: "" }];
}
export default function Home() {
  return (
    <div className="flex flex-col items-center p-3 gap-3">
      <h1>WebBook coming soon!</h1>
      <Button>Get Notified</Button>
    </div>
  );
}
