import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/ui/editable-text";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dev")({
	component: RouteComponent,
});

function RouteComponent() {
	const [editValue, setEditValue] = useState("Hello World");
	const [isDark, setIsDark] = useState(false);

	const toggleTheme = () => {
		const newIsDark = !isDark;
		setIsDark(newIsDark);
		document.documentElement.classList.toggle("dark", newIsDark);
	};

	return (
		<div className="p-6 flex flex-col gap-3 border items-start ">
			<div>
				<Button onClick={toggleTheme}>Toggle Theme</Button>
			</div>
			<EditableText
				initialValue={editValue}
				onSave={(value) => {
					setEditValue(value);
					console.log("Saved value:", value);
				}}
				className=""
			/>
			<Input />
		</div>
	);
}
