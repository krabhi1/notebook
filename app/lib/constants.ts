// Default content for editors
export const defaultWebContent = {
  html: `<div class="flex items-center justify-center min-h-screen">
  <div class="bg-white shadow-lg rounded-lg p-6 w-96 text-center fade-in">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">Hello Tailwind!</h1>
    <p class="text-gray-600 mb-6">
      This is a simple HTML + CSS + JS example using Tailwind.
    </p>
    <button
      id="colorBtn"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
      Change Background
    </button>
  </div>
</div>
      `,
  css: `.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
    `,
  js: `const btn = document.getElementById('colorBtn');
const colors = ['bg-red-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'];
let index = 0;

btn.addEventListener('click', () => {
  document.body.classList.remove(...colors);
  document.body.classList.add(colors[index]);
  index = (index + 1) % colors.length;
});

`,
};

export const defaultJsContent = `
  console.log("Welcome to WebBook with Javascript!");
  `;
export const defaultTsContent = `
  console.log("Welcome to WebBook with TypeScript!")
  `;

// Default content for Mermaid diagrams
export const defaultMermaidContent = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`;

// Default content for Database schemas
export const defaultDatabaseContent = `-- Database schema
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add your tables here...`;

// Default content for Editor.js (returns a function to include dynamic timestamp)
export const defaultEditorJsContent = () => `{
  "time": ${Date.now()},
  "blocks": [
    {
      "type": "header",
      "data": {
        "text": "Welcome to Editor.js!",
        "level": 1
      }
    },
    {
      "type": "paragraph",
      "data": {
        "text": "Start writing your content here..."
      }
    }
  ],
  "version": "2.28.2"
}`;

// Default content for Circuit diagrams (returns a function to include dynamic name and timestamp)
export const defaultCircuitContent = (name: string) => `{
  "components": [],
  "connections": [],
  "metadata": {
    "name": "${name}",
    "description": "Circuit diagram",
    "created": "${new Date().toISOString()}"
  }
}`;
