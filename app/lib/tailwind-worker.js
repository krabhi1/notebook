import { compile } from "tailwindcss";
// In your tailwind-worker.js
import tailwindStyles from "tailwindcss/index.css?raw";

// We listen for code updates from the main UI
self.onmessage = async (event) => {
  const { html, css: customCSS } = event.data;

  try {
    // 1. Initialize the compiler with your CSS (including @theme or @import)
    const css = customCSS || `@import "tailwindcss";`;

    const compiler = await compile(css, {
      base: "/",
      loadStylesheet: async (id, base) => {
        console.log(`Loading stylesheet: ${id} (base: ${base})`);
        // Load built-in Tailwind stylesheets
        if (id === "tailwindcss") {
          return {
            path: "virtual:tailwindcss/index.css",
            content: tailwindStyles,
            base,
          };
        }
        throw new Error(`Unknown stylesheet: ${id}`);
      },
      loadModule: async () => {
        throw new Error("Plugins not supported in browser");
      },
    });

    // 2. Extract class names from the HTML to 'build' only what is used
    const candidates = extractClasses(html);

    // 3. Generate the final CSS string
    const outputCss = compiler.build(candidates);
    console.log("Generated CSS:", outputCss);

    // 4. Send it back to the main thread to update the iframe
    self.postMessage({ css: outputCss });
  } catch (err) {
    console.log(err);
    self.postMessage({ error: err.message });
  }
};

function extractClasses(html) {
  // Simple regex to find class="..." or className="..."
  const classRegex = /(?:class|className)\s*=\s*["']([^"']+)["']/g;
  const classes = [];
  let match;
  while ((match = classRegex.exec(html)) !== null) {
    classes.push(...match[1].split(/\s+/));
  }
  return [...new Set(classes)]; // Unique classes only
}
