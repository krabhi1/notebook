import type { Route } from "./+types/_index";
import Navbar from "~/components/landing/Navbar";
import Hero from "~/components/landing/Hero";

import Features from "~/components/landing/Features";
import HowItWorks from "~/components/landing/HowItWorks";
import TechStack from "~/components/landing/TechStack";
import Footer from "~/components/landing/Footer";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WebBook - Unified Browser Workspace" },
    {
      name: "description",
      content:
        "Run code, draw diagrams, write markdown, and manage pages — all autosaved to the cloud.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {}

export default function Home() {
  useEffect(() => {
    const worker = new Worker(
      new URL("../lib/tailwind-worker.js", import.meta.url),
      { type: "module" },
    );
    const html = `<div class="p-4 bg-blue-500 text-white rounded-lg">
  <h1 class="text-2xl font-bold mb-2">Hello, Tailwind Worker!</h1>
  <p>This is a test of Tailwind CSS in a Web Worker.</p>
</div>
`;
    const css = `
      @import "tailwindcss";
`;
    worker.postMessage({ html, css });
    worker.onmessage = (event) => {
      console.log("Received from worker:", event);
    };
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Hero />
      <Features />
      <HowItWorks />
      <TechStack />
      <Footer />
    </div>
  );
}
