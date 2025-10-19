import type { Route } from "../app._index/+types/route";

export default function Page({}: Route.ComponentProps) {
  return (
    <div className="flex justify-center items-center h-full">
      No page selected
    </div>
  );
}
