export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-semibold text-center text-gray-900 mb-14">
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: 1,
              title: "Organize your workspace",
              text: "Create folders to group related pages and projects.",
            },
            {
              step: 2,
              title: "Add a new page",
              text: "Choose Web, Code, Mermaid, Excalidraw, or Database.",
            },
            {
              step: 3,
              title: "Everything auto-saves",
              text: "Your content syncs instantly to the cloud.",
            },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-sm">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
