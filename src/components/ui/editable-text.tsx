import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type EditableTextProps = {
	initialValue: string;
	onSave?: (value: string) => Promise<unknown>;
	className?: string;
	className2?: string;
	floating?: boolean;
	editing?: boolean;
	onEditingChange?: (editing: boolean) => void;
	triggerMode?: "click" | "doubleClick" | "none";
} & React.HTMLAttributes<HTMLElement>;

export function EditableText({
	initialValue,
	onSave,
	className,
	className2,
	floating = false,
	editing,
	onEditingChange,
	triggerMode,
	...props
}: EditableTextProps) {
	const [internalEditing, setInternalEditing] = useState(false);
	const [value, setValue] = useState(initialValue);
	const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});
	const inputRef = useRef<HTMLInputElement>(null);
	const isControlled = editing !== undefined;
	const isEditing = isControlled ? editing : internalEditing;
	const mode = triggerMode ?? (floating ? "doubleClick" : "click");
	const isInteractive = mode !== "none";

	const setEditing = (next: boolean) => {
		if (!isControlled) {
			setInternalEditing(next);
		}
		onEditingChange?.(next);
	};

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

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
		setEditing(false);
		setPositionStyle({});
		const nextValue = value.trim();
		if (nextValue === "" || nextValue === initialValue) {
			setValue(initialValue);
			return;
		}
		try {
			await onSave?.(nextValue);
		} catch (_) {
			// Revert to initial value on error
			setValue(initialValue);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			finishEditing();
		} else if (event.key === "Escape") {
			setEditing(false);
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

	const { onClick, onDoubleClick, onKeyDown, ...restProps } = props;

	if (!isInteractive) {
		return (
			<div className="relative inline-block w-full">
				<div
					className={cn(
						"px-1.5 py-1 border border-transparent! focus:outline-none overflow-clip text-ellipsis whitespace-nowrap",
						className2,
					)}
					{...restProps}
				>
					{value}
				</div>
				{isEditing && floating && inputElement}
			</div>
		);
	}

	return (
		<div className="relative inline-block w-full">
			<button
				type="button"
				onDoubleClick={(event) => {
					event.stopPropagation();
					if (mode === "doubleClick") {
						setEditing(true);
					}
					onDoubleClick?.(event);
				}}
				onClick={(event) => {
					event.stopPropagation();
					if (mode === "click") {
						setEditing(true);
					}
					onClick?.(event);
				}}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						setEditing(true);
					}
					onKeyDown?.(event);
				}}
				className={cn(
					"w-full text-left px-1.5 py-1 border border-transparent! focus:outline-none overflow-clip text-ellipsis whitespace-nowrap cursor-pointer",
					className2,
				)}
				{...restProps}
			>
				{value || "Untitled"}
			</button>
			{isEditing && floating && inputElement}
		</div>
	);
}
