import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type EditableTextProps = {
	initialValue: string;
	onSave?: (value: string) => Promise<unknown>;
	className?: string;
	className2?: string;
	floating?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function EditableText({
	initialValue,
	onSave,
	className,
	className2,
	floating = false,
	...props
}: EditableTextProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState(initialValue);
	const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isEditing) setValue(initialValue);
	}, [initialValue, isEditing]);

	useLayoutEffect(() => {
		if (!isEditing || !floating || !inputRef.current) return;

		const input = inputRef.current;
		input.focus();

		// Calculate bounds to prevent window overflow
		const rect = input.getBoundingClientRect();
		const viewportWidth = window.innerWidth;

		let horizontalOffset: React.CSSProperties = { left: 0 };

		// If it overflows the right edge
		if (rect.right > viewportWidth) {
			horizontalOffset = { right: 0, left: "auto" };
		}

		// If it overflows the left edge (even after right adjustment)
		if (rect.left < 0) {
			horizontalOffset = { left: 0, right: "auto" };
		}

		setPositionStyle(horizontalOffset);
	}, [isEditing, floating]);

	const finishEditing = async () => {
		setIsEditing(false);
		setPositionStyle({});
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
			setPositionStyle({});
			setValue(initialValue);
		}
	};

	const inputElement = (
		<input
			ref={inputRef}
			value={value}
			onChange={(event) => setValue(event.target.value)}
			onClick={(e) => e.stopPropagation()}
			onBlur={finishEditing}
			onKeyDown={handleKeyDown}
			style={floating ? positionStyle : undefined}
			className={cn(
				"border border-border rounded px-1.5 py-1 focus:outline-none min-w-40 bg-background",
				floating && "absolute top-full mt-1 z-50 shadow-md",
				className,
			)}
		/>
	);

	if (isEditing && !floating) {
		return inputElement;
	}

	return (
		<div ref={containerRef} className="relative inline-block w-full">
			{/* biome-ignore lint/a11y/noStaticElementInteractions: todo */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: todo */}
			<div
				onDoubleClick={(e) => {
					if (floating) {
						e.stopPropagation();
						setIsEditing(true);
					}
				}}
				onClick={(e) => {
					e.stopPropagation();
					if (!floating) {
						setIsEditing(true);
					}
				}}
				className={cn(
					"px-1.5 py-1 border border-transparent! focus:outline-none overflow-clip text-ellipsis whitespace-nowrap cursor-pointer",
					className2,
				)}
				{...props}
			>
				{value || "Untitled"}
			</div>
			{isEditing && floating && inputElement}
		</div>
	);
}
