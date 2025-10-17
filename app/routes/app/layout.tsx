import { Outlet } from "react-router";
import type { Route } from "./+types/layout";

export default function Page({}: Route.ComponentProps) {
  return (
    <div className="h-screen flex flex-col">
      <header className="h-10 shrink-0 border-b bg-gray-100">Header</header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 bg-gray-100 border-r overflow-auto"></aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
