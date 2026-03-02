import { ClientOnly } from "@tanstack/react-router";
import { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MermaidViewer } from "./MermaidViewer";

const DEFAULT_CODE = `graph TD
    A[Start Typing Mermaid Code] --> B{Interactive?}
    B -- Yes --> C[Pan with Mouse]
    B -- Yes --> D[Zoom with Scroll]
    C --> E[Double Click to Reset]
    D --> E

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#00ff00,stroke:#333,stroke-width:4px`;

export default function Dashboard() {
	const [code, setCode] = useState(DEFAULT_CODE);

	return (
		<div className="h-full w-full p-2 flex flex-col min-h-0">
			<div className="border h-full w-full rounded-lg bg-background shadow-sm overflow-hidden flex flex-col min-h-0">
				<ResizablePanelGroup className="flex-1 min-h-0">
					<ResizablePanel
						defaultSize={40}
						minSize={20}
						className="flex flex-col min-h-0"
					>
						<div className="h-full flex flex-col min-h-0">
							<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/30 shrink-0">
								Editor
							</div>
							<div className="flex-1 min-h-0 w-full overflow-hidden">
								<CodeEditor
									value={code}
									onChange={(val) => setCode(val || "")}
									language="markdown"
								/>
							</div>
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel
						defaultSize={60}
						minSize={30}
						className="flex flex-col min-h-0"
					>
						<div className="h-full flex flex-col min-h-0 p-2">
							<div className="px-3 py-1 text-xs font-medium text-muted-foreground mb-2 shrink-0">
								Preview
							</div>
							<div className="flex-1 min-h-0 overflow-hidden relative">
								<ClientOnly>
									<MermaidViewer code={code} />
								</ClientOnly>
							</div>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}
