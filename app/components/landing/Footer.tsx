export default function Footer() {
  return (
    <footer className="py-14 bg-gray-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <span className="text-2xl font-bold text-white mb-6 md:mb-0">
            WebBook
          </span>

          <div className="flex gap-6">
            <a
              href="https://github.com"
              className="text-gray-400 hover:text-white text-sm"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com"
              className="text-gray-400 hover:text-white text-sm"
            >
              Twitter
            </a>
            <a
              href="mailto:hello@webbook.com"
              className="text-gray-400 hover:text-white text-sm"
            >
              Email
            </a>
            <a
              href="/privacy"
              className="text-gray-400 hover:text-white text-sm"
            >
              Privacy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
