import ScreenshotPlaceholder from "./ScreenshotPlaceholder";

export default function Hero() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          A unified browser workspace for code, diagrams, notes, and SQL.
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Run code, draw diagrams, write markdown, and manage pages — all
          autosaved to the cloud.
        </p>

        <div className="flex gap-4 justify-center mb-14">
          <a
            href="/app"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Open WebBook
          </a>

          <a
            href="https://github.com"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            View Source
          </a>
        </div>

        <ScreenshotPlaceholder />
      </div>
    </section>
  );
}
