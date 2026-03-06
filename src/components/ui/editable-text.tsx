import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type EditableTextProps = {
	initialValue: string;
	onSave: (value: string) => void;
	className?: string;
};

export function EditableText({
	initialValue,
	onSave,
	className,
}: EditableTextProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState(initialValue);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	useEffect(() => {
		if (!isEditing) return;
		const input = inputRef.current;
		input?.focus();
	}, [isEditing]);

	const finishEditing = () => {
		setIsEditing(false);
		if (value.trim() === "" || value === initialValue) return;
		onSave(value);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			finishEditing();
		} else if (event.key === "Escape") {
			setIsEditing(false);
			setValue(initialValue);
		}
	};

	if (isEditing) {
		return (
			<input
				ref={inputRef}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				onBlur={finishEditing}
				onKeyDown={handleKeyDown}
				className={cn(
					"border border-border rounded  px-1.5 py-1 focus:outline-none w-40 md:w-auto",
					className,
				)}
			/>
		);
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: todo
		// biome-ignore lint/a11y/useKeyWithClickEvents: todo
		<span
			onClick={() => setIsEditing(true)}
			className={cn(
				"px-1.5 py-1 border border-transparent! focus:outline-none w-40 md:w-auto overflow-clip md:overflow-auto  text-ellipsis whitespace-nowrap cursor-pointer",
				className,
			)}
		>
			{value || "Untitled"}
		</span>
	);
}
