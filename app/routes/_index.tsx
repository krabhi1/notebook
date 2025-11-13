import type { Route } from "./+types/_index";
import Navbar from "~/components/landing/Navbar";
import Hero from "~/components/landing/Hero";

import Features from "~/components/landing/Features";
import HowItWorks from "~/components/landing/HowItWorks";
import TechStack from "~/components/landing/TechStack";
import Footer from "~/components/landing/Footer";

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
