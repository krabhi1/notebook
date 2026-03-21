import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import CodeEditor from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/ui/editable-text";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/providers/app-provider";

export const Route = createFileRoute("/dev")({
	component: RouteComponent,
});

function RouteComponent() {
	const [editValue, setEditValue] = useState("Hello World");
	const { isDark, toggleMode } = useAppContext();

	return (
		<div className="p-6 flex flex-col gap-3 border items-start ">
			<div>
				<Button onClick={toggleMode}>
					{isDark ? "Switch to Light" : "Switch to Dark"}
				</Button>
			</div>
			<EditableText
				initialValue={editValue}
				onSave={async (value) => {
					setEditValue(value);
					console.log("Saved value:", value);
				}}
				className=""
			/>
			<Input />
			<div className="w-full flex flex-col h-60 ">
				<CodeEditorComponent />
			</div>
		</div>
	);
}

function CodeEditorComponent() {
	const files = {
		"script.js": {
			name: "script.js",
			language: "javascript",
			value: 'console.log("Hello");',
		},
		"script2.ts": {
			name: "script2.ts",
			language: "typescript",
			value: 'console.log("Hello2");',
		},
		"style.css": {
			name: "style.css",
			language: "css",
			value: "body { color: red; }",
		},
	};
	const [fileName, setFileName] = useState<keyof typeof files>("script.js");
	const file = files[fileName];

	return (
		<>
			<div className="flex gap-2 mb-2">
				{Object.keys(files).map((name) => (
					<Button
						key={name}
						onClick={() => setFileName(name as keyof typeof files)}
					>
						{name}
					</Button>
				))}
			</div>
			<CodeEditor
				path={file.name} // Unique path manages state automatically
				defaultLanguage={file.language}
				defaultValue={file.value}
				onChange={(c, e) => {
					console.log("change", c, e);
				}}
			/>
		</>
	);
}
