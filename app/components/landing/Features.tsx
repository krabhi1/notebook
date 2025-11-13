export default function Features() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-semibold text-center text-gray-900 mb-14">
          Everything you need in one workspace
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {[
            {
              icon: "⚡",
              title: "Code Execution",
              text: "Run JavaScript, Python, and more directly in your browser.",
            },
            {
              icon: "✏️",
              title: "Excalidraw",
              text: "Create hand-drawn style diagrams and sketches.",
            },
            {
              icon: "🗄️",
              title: "SQL Sandbox",
              text: "Query databases and visualize results in real-time.",
            },
            {
              icon: "📝",
              title: "Markdown + Mermaid",
              text: "Write rich docs with embedded diagrams.",
            },
            {
              icon: "☁️",
              title: "Cloud Auto-Sync",
              text: "Your work is always saved automatically.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600">{f.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
