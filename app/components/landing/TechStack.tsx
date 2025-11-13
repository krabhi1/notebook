export default function TechStack() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-semibold text-center text-gray-900 mb-14">
          Built with modern technology
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {[
            "React",
            "React Router",
            "Tailwind CSS",
            "Monaco Editor",
            "Drizzle ORM",
            "Turso Sqlite",
            "Cloudflare Workers",
            "Zod",
            "Better Auth",
          ].map((t) => (
            <span
              key={t}
              className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
