export const DEFAULT_DOCUMENT_CONTENT = {
	mermaid: `flowchart TD
  A[Christmas] -->|Get money| B(Go shopping)
  B --> C{Let me think}
  C -->|One| D[Laptop]
  C -->|Two| E[iPhone]
  C -->|Three| F[fa:fa-car Car]
    `,
} as Record<string, string | undefined>;
