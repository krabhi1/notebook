import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "WebPad" }, { name: "description", content: "" }];
}

export default function Home() {
  return <div>WebPad coming soon!</div>;
}
