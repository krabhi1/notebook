import { useState } from "react";

export type EditorTab = "html" | "css" | "js";

// Console log types
export interface ConsoleLog {
  id: string;
  type: "log" | "error" | "warn" | "info";
  args: any[];
  timestamp: number;
  count: number;
  content: string; // For duplicate detection
}

export const formatConsoleArgs = (args: any[]) => {
  return args
    .map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");
};
export const getLogStyle = (type: string) => {
  switch (type) {
    case "error":
      return { icon: "×", color: "text-red-400" };
    case "warn":
      return { icon: "!", color: "text-yellow-400" };
    case "info":
      return { icon: "i", color: "text-blue-400" };
    default:
      return { icon: ">", color: "text-gray-300" };
  }
};
// Static iframe HTML (similar to Tailwind Play)
export const iframeHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style id="_style" type="text/tailwindcss"></style>

    <script>
      var hasHtml = false
      var hasCss = false
      var visible = false
      var lastHtml = undefined

      window.addEventListener('message', (e) => {
        if (typeof e.data.clear !== 'undefined') {
          setHtml()
          setCss()
          setJs()
          checkVisibility()
          return
        }
        if (typeof e.data.css !== 'undefined') {
          setCss(e.data.css)
        }
        if (typeof e.data.html !== 'undefined') {
          setHtml(e.data.html)
        }
        if (typeof e.data.js !== 'undefined') {
          setJs(e.data.js)
        }
        if (typeof e.data.consoleLog !== 'undefined') {
          // Send console logs back to parent
          window.parent.postMessage({
            type: 'console',
            log: e.data.consoleLog
          }, '*')
        }
        checkVisibility()
      })

      // Override console methods to capture logs
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      }

      function serializeArg(arg) {
        try {
          // Handle special cases that can't be cloned
          if (arg === window) return '[object Window]'
          if (arg === document) return '[object Document]'
          if (arg === null) return null
          if (arg === undefined) return undefined

          // Handle functions
          if (typeof arg === 'function') {
            return '[Function: ' + (arg.name || 'anonymous') + ']'
          }

          // Handle DOM elements
          if (arg instanceof Element) {
            var tagName = arg.tagName.toLowerCase()
            var id = arg.id ? '#' + arg.id : ''
            var className = arg.className ? '.' + arg.className.replace(/\\s+/g, '.') : ''
            return '[' + tagName + id + className + ']'
          }

          // Handle circular references and complex objects
          if (typeof arg === 'object' && arg !== null) {
            try {
              JSON.stringify(arg)
              return arg
            } catch (e) {
              return '[object Object (circular)]'
            }
          }

          return arg
        } catch (e) {
          return '[object (unserializable)]'
        }
      }

      function createConsoleOverride(type) {
        return function(...args) {
          // Call original console method
          originalConsole[type].apply(console, args)

          // Serialize args to avoid DataCloneError
          const serializedArgs = args.map(serializeArg)

          // Send to parent
          window.parent.postMessage({
            type: 'console',
            log: {
              type: type,
              args: serializedArgs,
              timestamp: Date.now()
            }
          }, '*')
        }
      }

      console.log = createConsoleOverride('log')
      console.error = createConsoleOverride('error')
      console.warn = createConsoleOverride('warn')
      console.info = createConsoleOverride('info')

      // Capture JavaScript errors
      window.addEventListener('error', function(event) {
        window.parent.postMessage({
          type: 'console',
          log: {
            type: 'error',
            args: [event.message + ' at line ' + event.lineno + ':' + event.colno],
            timestamp: Date.now()
          }
        }, '*')
      })

      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', function(event) {
        window.parent.postMessage({
          type: 'console',
          log: {
            type: 'error',
            args: ['Unhandled Promise Rejection: ' + (event.reason || 'Unknown error')],
            timestamp: Date.now()
          }
        }, '*')
      })

      function checkVisibility() {
        if (!visible && hasHtml) {
          visible = true
          document.body.style.display = ''
        } else if (visible && !hasHtml) {
          visible = false
          document.body.style.display = 'none'
        }
      }

      function setHtml(html) {
        if (typeof html === 'undefined') {
          document.body.innerHTML = ''
          lastHtml = undefined
          hasHtml = false
        } else if (lastHtml !== html) {
          document.body.innerHTML = html
          lastHtml = html
          hasHtml = true
        } else {
          hasHtml = true
        }
      }

      function setCss(css) {
        const style = document.getElementById('_style')
        const newStyle = document.createElement('style')
        newStyle.type = 'text/tailwindcss'
        newStyle.id = '_style'
        newStyle.innerHTML = typeof css === 'undefined' ? '' : css
        style.parentNode.replaceChild(newStyle, style)
        hasCss = typeof css === 'undefined' ? false : true
      }

      function setJs(js) {
        // Remove existing custom script
        const existingScript = document.getElementById('_script')
        if (existingScript) {
          existingScript.remove()
        }

        // Add new script
        if (typeof js !== 'undefined' && js.trim()) {
          try {
            const script = document.createElement('script')
            script.id = '_script'
            // Wrap user code in IIFE to prevent variable redeclaration errors
            script.textContent = '(function() { "use strict"; try { ' + js + ' } catch(e) { console.error("Runtime Error: " + e.message); } })();'
            document.body.appendChild(script)
          } catch (error) {
            console.error('JavaScript injection error:', error)
          }
        }
      }
    </script>
  </head>
  <body style="display:none"></body>
  <script>
  document.addEventListener(
    'click',
    function (e) {
      if (!e.target?.closest('a[href^="#"]')) return;
      e.preventDefault();
    },
    { capture: true }
  );


    document.body.addEventListener('click', (event) => {
      if (event.which !== 1) return
      if (event.metaKey || event.ctrlKey || event.shiftKey) return
      if (event.defaultPrevented) return

      let el = event.target
      while (el && el.nodeName !== 'A') el = el.parentNode
      if (!el || el.nodeName !== 'A') return

      if (
        el.hasAttribute('download') ||
        el.getAttribute('rel') === 'external' ||
        el.target
      ) {
        return
      }

      event.preventDefault()
      window.open(el.href, '_blank')
    })
  </script>
</html>`;

// Tailwind CSS classes for autocomplete
export const tailwindClasses = [
  // Layout
  "container",
  "box-border",
  "box-content",
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "table",
  "inline-table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row-group",
  "table-row",
  "flow-root",
  "grid",
  "inline-grid",
  "contents",
  "list-item",
  "hidden",

  // Flexbox & Grid
  "flex-row",
  "flex-row-reverse",
  "flex-col",
  "flex-col-reverse",
  "flex-wrap",
  "flex-wrap-reverse",
  "flex-nowrap",
  "items-start",
  "items-end",
  "items-center",
  "items-baseline",
  "items-stretch",
  "justify-start",
  "justify-end",
  "justify-center",
  "justify-between",
  "justify-around",
  "justify-evenly",

  // Spacing
  "p-0",
  "p-1",
  "p-2",
  "p-3",
  "p-4",
  "p-5",
  "p-6",
  "p-8",
  "p-10",
  "p-12",
  "p-16",
  "p-20",
  "p-24",
  "p-32",
  "p-40",
  "p-48",
  "p-56",
  "p-64",
  "px-0",
  "px-1",
  "px-2",
  "px-3",
  "px-4",
  "px-5",
  "px-6",
  "px-8",
  "px-10",
  "px-12",
  "px-16",
  "px-20",
  "px-24",
  "px-32",
  "px-40",
  "px-48",
  "px-56",
  "px-64",
  "py-0",
  "py-1",
  "py-2",
  "py-3",
  "py-4",
  "py-5",
  "py-6",
  "py-8",
  "py-10",
  "py-12",
  "py-16",
  "py-20",
  "py-24",
  "py-32",
  "py-40",
  "py-48",
  "py-56",
  "py-64",
  "m-0",
  "m-1",
  "m-2",
  "m-3",
  "m-4",
  "m-5",
  "m-6",
  "m-8",
  "m-10",
  "m-12",
  "m-16",
  "m-20",
  "m-24",
  "m-32",
  "m-40",
  "m-48",
  "m-56",
  "m-64",
  "mx-0",
  "mx-1",
  "mx-2",
  "mx-3",
  "mx-4",
  "mx-5",
  "mx-6",
  "mx-8",
  "mx-10",
  "mx-12",
  "mx-16",
  "mx-20",
  "mx-24",
  "mx-32",
  "mx-40",
  "mx-48",
  "mx-56",
  "mx-64",
  "my-0",
  "my-1",
  "my-2",
  "my-3",
  "my-4",
  "my-5",
  "my-6",
  "my-8",
  "my-10",
  "my-12",
  "my-16",
  "my-20",
  "my-24",
  "my-32",
  "my-40",
  "my-48",
  "my-56",
  "my-64",

  // Sizing
  "w-0",
  "w-1",
  "w-2",
  "w-3",
  "w-4",
  "w-5",
  "w-6",
  "w-8",
  "w-10",
  "w-12",
  "w-16",
  "w-20",
  "w-24",
  "w-32",
  "w-40",
  "w-48",
  "w-56",
  "w-64",
  "w-auto",
  "w-full",
  "w-screen",
  "w-min",
  "w-max",
  "w-fit",
  "h-0",
  "h-1",
  "h-2",
  "h-3",
  "h-4",
  "h-5",
  "h-6",
  "h-8",
  "h-10",
  "h-12",
  "h-16",
  "h-20",
  "h-24",
  "h-32",
  "h-40",
  "h-48",
  "h-56",
  "h-64",
  "h-auto",
  "h-full",
  "h-screen",
  "h-min",
  "h-max",
  "h-fit",

  // Typography
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-5xl",
  "text-6xl",
  "text-7xl",
  "text-8xl",
  "text-9xl",
  "font-thin",
  "font-extralight",
  "font-light",
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
  "font-extrabold",
  "font-black",
  "text-left",
  "text-center",
  "text-right",
  "text-justify",

  // Colors
  "text-black",
  "text-white",
  "text-gray-50",
  "text-gray-100",
  "text-gray-200",
  "text-gray-300",
  "text-gray-400",
  "text-gray-500",
  "text-gray-600",
  "text-gray-700",
  "text-gray-800",
  "text-gray-900",
  "text-red-50",
  "text-red-100",
  "text-red-200",
  "text-red-300",
  "text-red-400",
  "text-red-500",
  "text-red-600",
  "text-red-700",
  "text-red-800",
  "text-red-900",
  "text-blue-50",
  "text-blue-100",
  "text-blue-200",
  "text-blue-300",
  "text-blue-400",
  "text-blue-500",
  "text-blue-600",
  "text-blue-700",
  "text-blue-800",
  "text-blue-900",
  "text-green-50",
  "text-green-100",
  "text-green-200",
  "text-green-300",
  "text-green-400",
  "text-green-500",
  "text-green-600",
  "text-green-700",
  "text-green-800",
  "text-green-900",

  "bg-black",
  "bg-white",
  "bg-gray-50",
  "bg-gray-100",
  "bg-gray-200",
  "bg-gray-300",
  "bg-gray-400",
  "bg-gray-500",
  "bg-gray-600",
  "bg-gray-700",
  "bg-gray-800",
  "bg-gray-900",
  "bg-red-50",
  "bg-red-100",
  "bg-red-200",
  "bg-red-300",
  "bg-red-400",
  "bg-red-500",
  "bg-red-600",
  "bg-red-700",
  "bg-red-800",
  "bg-red-900",
  "bg-blue-50",
  "bg-blue-100",
  "bg-blue-200",
  "bg-blue-300",
  "bg-blue-400",
  "bg-blue-500",
  "bg-blue-600",
  "bg-blue-700",
  "bg-blue-800",
  "bg-blue-900",
  "bg-green-50",
  "bg-green-100",
  "bg-green-200",
  "bg-green-300",
  "bg-green-400",
  "bg-green-500",
  "bg-green-600",
  "bg-green-700",
  "bg-green-800",
  "bg-green-900",

  // Border & Border Radius
  "border",
  "border-0",
  "border-2",
  "border-4",
  "border-8",
  "border-t",
  "border-r",
  "border-b",
  "border-l",
  "rounded",
  "rounded-none",
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-full",

  // Shadow
  "shadow-sm",
  "shadow",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
  "shadow-inner",
  "shadow-none",

  // Effects
  "opacity-0",
  "opacity-25",
  "opacity-50",
  "opacity-75",
  "opacity-100",

  // Transitions
  "transition",
  "transition-none",
  "transition-all",
  "transition-colors",
  "transition-opacity",
  "transition-shadow",
  "transition-transform",
  "duration-75",
  "duration-100",
  "duration-150",
  "duration-200",
  "duration-300",
  "duration-500",
  "duration-700",
  "duration-1000",

  // Transform
  "transform",
  "transform-gpu",
  "transform-none",

  // Interactivity
  "cursor-auto",
  "cursor-default",
  "cursor-pointer",
  "cursor-wait",
  "cursor-text",
  "cursor-move",
  "cursor-help",
  "cursor-not-allowed",

  // Responsive prefixes
  "sm:",
  "md:",
  "lg:",
  "xl:",
  "2xl:",

  // State prefixes
  "hover:",
  "focus:",
  "active:",
  "disabled:",
  "visited:",
];
