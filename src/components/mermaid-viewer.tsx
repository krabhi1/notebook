import * as d3 from "d3";
import mermaid from "mermaid";
import { useCallback, useEffect, useId, useRef, useState } from "react";

interface MermaidViewerProps {
	code: string;
	onReady?: () => void;
}

// Global configuration for mermaid
mermaid.initialize({
	startOnLoad: false,
	theme: "default",
	securityLevel: "loose",
	fontFamily: "inherit",
	flowchart: { useMaxWidth: false },
	suppressErrorRendering: true,
});

/**
 * MermaidViewer renders a mermaid diagram with D3-powered zoom and pan capabilities.
 * It persists the zoom and pan state even when the diagram code changes.
 */
export function MermaidViewer({ code, onReady }: MermaidViewerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);
	const uniqueId = Math.random().toString(36).substr(2, 9) + useId();

	// Persist the D3 transform across renders
	const transformRef = useRef<d3.ZoomTransform | null>(null);

	/**
	 * Sets up D3 zoom and fits the diagram to the container
	 */
	const setupZoom = useCallback(
		(svgElement: SVGSVGElement, container: HTMLDivElement) => {
			const svg = d3.select(svgElement);
			const g = svg.select("g");
			if (g.empty()) return;

			const { clientWidth: width, clientHeight: height } = container;

			// 1. Prepare SVG for D3 manipulation
			svg
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("viewBox", null)
				.style("max-width", "none")
				.style("display", "block")
				.style("overflow", "visible");

			// 2. Setup Zoom Behavior
			const zoom = d3
				.zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.05, 10])
				.on("zoom", (event) => {
					g.attr("transform", event.transform);
					transformRef.current = event.transform;
				});

			svg.call(zoom);

			// 3. Initial Transform: Use persisted state or calculate "Fit to Screen"
			if (transformRef.current) {
				svg.call(zoom.transform, transformRef.current);
			} else {
				const bbox = (g.node() as SVGGElement).getBBox();
				const padding = 40;

				const scale = Math.min(
					(width - padding) / bbox.width,
					(height - padding) / bbox.height,
				);

				const initialTransform = d3.zoomIdentity
					.translate(width / 2, height / 2)
					.scale(scale)
					.translate(-(bbox.x + bbox.width / 2), -(bbox.y + bbox.height / 2));

				svg.call(zoom.transform, initialTransform);
			}
		},
		[],
	);

	useEffect(() => {
		let isCancelled = false;

		const renderDiagram = async () => {
			const cleanCode = code.trim();
			if (!containerRef.current || !cleanCode) {
				onReady?.();
				return;
			}

			try {
				// Validate syntax before rendering
				await mermaid.parse(cleanCode);

				// Render SVG string
				const { svg } = await mermaid.render(`mermaid-${uniqueId}`, cleanCode);

				if (isCancelled) return;

				if (containerRef.current) {
					containerRef.current.innerHTML = svg;
					const svgElement = containerRef.current.querySelector("svg");
					if (svgElement) {
						setupZoom(svgElement, containerRef.current);
					}
				}
				setError(null);
			} catch (_) {
				// console.error("Mermaid rendering error:", err);
				setError("Invalid Mermaid syntax");
			} finally {
				onReady?.();
			}
		};

		renderDiagram();

		return () => {
			isCancelled = true;
		};
	}, [code, onReady, setupZoom, uniqueId]);

	return (
		<div className="relative w-full h-full min-h-75 overflow-hidden   group">
			{/* Controls Information */}
			<div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 pointer-events-none select-none bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">
				Scroll to zoom • Drag to pan
			</div>

			{/* Error Overlay */}
			{error && (
				<div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 z-10 p-4">
					<div className="text-sm font-medium text-red-600 dark:text-red-400 px-3 py-2 bg-white dark:bg-slate-800 rounded border border-red-200 dark:border-red-900/50 shadow-sm">
						{error}
					</div>
				</div>
			)}

			{/* Diagram Target */}
			<div
				ref={containerRef}
				className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
			/>
		</div>
	);
}
