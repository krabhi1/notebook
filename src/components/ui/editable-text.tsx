import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type EditableTextProps = {
	initialValue: string;
	onSave?: (value: string) => Promise<unknown>;
	className?: string;
	className2?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function EditableText({
	initialValue,
	onSave,
	className,
	className2,
	...props
}: EditableTextProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState(initialValue);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isEditing) setValue(initialValue);
	}, [initialValue, isEditing]);

	useEffect(() => {
		if (!isEditing) return;
		const input = inputRef.current;
		input?.focus();
	}, [isEditing]);

	const finishEditing = async () => {
		setIsEditing(false);
		if (value.trim() === "" || value === initialValue) return;
		try {
			await onSave?.(value);
		} catch (_) {
			// Revert to initial value on error
			setValue(initialValue);
		}
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
					"border border-border rounded  px-1.5 py-1 focus:outline-none min-w-40 ",
					className,
				)}
			/>
		);
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: todo
		<div
			onDoubleClick={() => setIsEditing(true)}
			className={cn(
				"px-1.5 py-1 border border-transparent! focus:outline-none   overflow-clip   text-ellipsis whitespace-nowrap cursor-pointer",
				className2,
			)}
			{...props}
		>
			{value || "Untitled"}
		</div>
	);
}
