export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-xl font-semibold text-gray-900">WebBook</span>

        <div className="flex items-center gap-6">
          <a
            href="/app/new"
            className="text-gray-700 hover:text-gray-900 text-sm"
          >
            Open App
          </a>
          <a
            href="https://github.com"
            className="text-gray-700 hover:text-gray-900 text-sm"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
