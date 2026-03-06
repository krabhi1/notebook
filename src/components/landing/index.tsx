/** biome-ignore-all lint/suspicious/noArrayIndexKey: static list*/
import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Code2,
	Cpu,
	Database,
	FolderTree,
	Layers,
	Layout,
	Moon,
	Palette,
	Save,
	Share2,
	Sparkles,
	Sun,
	Users,
	Wrench,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Landing() {
	const [isDark, setIsDark] = useState(false);

	const toggleTheme = () => {
		const newIsDark = !isDark;
		setIsDark(newIsDark);
		document.documentElement.classList.toggle("dark", newIsDark);
	};

	return (
		<div className="h-dvh overflow-y-auto scroll-smooth bg-surface font-sans text-text tracking-tight">
			{/* Navigation */}
			<header className="sticky top-0 z-50 flex h-14 items-center justify-between border-border border-b bg-surface px-6">
				<Link
					to="/"
					className="flex items-center gap-2 font-bold text-lg text-text transition-opacity hover:opacity-80"
				>
					<span>Notebook</span>
				</Link>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleTheme}
						className="rounded-lg text-text-muted hover:text-text"
					>
						{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
					</Button>
					<Button asChild size="sm">
						<Link to="/login">Get Started</Link>
					</Button>
				</div>
			</header>

			<main>
				{/* Hero Section */}
				<section className="mx-auto flex max-w-4xl flex-col items-center border-border/50 border-b px-6 py-20 text-center md:py-32">
					<div className="mb-8 inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-1 font-medium text-text-muted text-xs">
						<Sparkles className="size-3" />
						<span>All-in-one technical toolkit</span>
					</div>
					<h1 className="mb-6 font-bold text-4xl text-text tracking-tighter md:text-6xl">
						The workspace for <br />
						<span className="text-primary">useful tools.</span>
					</h1>
					<p className="mb-10 max-w-2xl text-lg text-text-muted leading-relaxed">
						Create documents with tools like Mermaid, Excalidraw diagrams, web
						editors, color palettes, and more. Edit with ease—we handle the
						rest. Everything is auto-saved and ready to share.
					</p>
					<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
						<Button
							size="lg"
							className="h-10 w-full rounded-lg px-8 font-semibold text-sm sm:w-auto"
							asChild
						>
							<Link to="/login">
								Start Creating
								<ArrowRight className="ml-2 size-4" />
							</Link>
						</Button>
					</div>
				</section>

				{/* Simple Value Props */}
				<section className="border-border border-b bg-surface px-6 py-20">
					<div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
						{[
							{
								icon: <Wrench className="size-5 text-primary" />,
								title: "Unified Collection",
								desc: "Mermaid diagrams, code editors, and more in one interface.",
							},
							{
								icon: <Save className="size-5 text-text" />,
								title: "Instant Auto-Save",
								desc: "Never lose a thought. Every change is persisted as you type.",
							},
							{
								icon: <Share2 className="size-5 text-text" />,
								title: "Easy Sharing",
								desc: "Generate links and collaborate with your team effortlessly.",
							},
						].map((item, i) => (
							<Card
								key={i}
								className="rounded-lg border border-border bg-transparent p-0 shadow-none"
							>
								<CardHeader className="p-6">
									<div className="mb-4 w-fit rounded-lg border border-border bg-panel p-2">
										{item.icon}
									</div>
									<CardTitle className="font-bold text-lg">
										{item.title}
									</CardTitle>
									<CardDescription className="mt-2 text-sm text-text-muted leading-relaxed">
										{item.desc}
									</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				</section>

				{/* Tool Explorer Visual Grid */}
				<section className="mx-auto max-w-5xl px-6 py-24">
					<div className="mb-12">
						<h2 className="mb-2 font-bold text-2xl tracking-tight">
							Explore the Explorer
						</h2>
						<p className="text-text-muted">
							One workspace for every technical need.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
						{/* Mermaid Card */}
						<div className="flex min-h-[300px] flex-col overflow-hidden rounded-lg border border-border bg-panel p-6 md:col-span-8">
							<div className="mb-4 flex items-center gap-2">
								<Zap className="size-4 text-primary" />
								<span className="font-bold text-sm">Mermaid Diagrams</span>
							</div>
							<div className="flex-1 rounded border border-border/50 bg-surface p-4 font-mono text-text-muted text-xs">
								<div className="text-primary italic">graph TD</div>
								<div className="ml-2">A[User] --&gt; B&#123;Auth&#125;</div>
								<div className="ml-2">B -- Yes --&gt; C[Dashboard]</div>
								<div className="ml-2">B -- No --&gt; D[Login]</div>
								<div className="mt-4 flex flex-col items-center border-border/30 border-t pt-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 text-[10px]">
										User
									</div>
									<div className="h-6 w-px bg-primary/40" />
									<div className="rounded border border-primary/40 px-3 py-1 text-[10px] italic">
										Auth?
									</div>
								</div>
							</div>
						</div>

						{/* Folders Card */}
						<div className="flex flex-col rounded-lg border border-border bg-panel p-6 md:col-span-4">
							<div className="mb-4 flex items-center gap-2">
								<FolderTree className="size-4 text-text" />
								<span className="font-bold text-sm">Structure</span>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2 rounded border border-border bg-surface p-2 text-xs">
									<FolderTree className="size-3 text-text-muted" />
									<span>System Architecture</span>
								</div>
								<div className="ml-4 flex items-center gap-2 rounded border border-border bg-surface/50 p-2 text-xs">
									<Layout className="size-3 text-text-muted" />
									<span>Database Schema</span>
								</div>
								<div className="ml-4 flex items-center gap-2 rounded border border-border bg-surface/50 p-2 text-xs">
									<Zap className="size-3 text-text-muted" />
									<span>API Flows</span>
								</div>
								<div className="flex items-center gap-2 rounded border border-border bg-surface p-2 text-xs">
									<Palette className="size-3 text-text-muted" />
									<span>UI Guidelines</span>
								</div>
							</div>
						</div>

						{/* Code Editor Card */}
						<div className="flex h-[240px] flex-col rounded-lg border border-border bg-panel p-6 md:col-span-5">
							<div className="mb-4 flex items-center gap-2">
								<Code2 className="size-4 text-text" />
								<span className="font-bold text-sm">Web Editor</span>
							</div>
							<div className="flex-1 rounded border border-border bg-surface p-4 font-mono text-[11px] leading-relaxed">
								<div className="text-text-muted">
									<span className="text-primary">const</span> app = () =&gt;
									&#123;
								</div>
								<div className="ml-2 text-text-muted">
									{" "}
									<span className="text-primary">return</span> (
								</div>
								<div className="ml-4 text-accent">
									&lt;div className="p-4"&gt;
								</div>
								<div className="ml-6 text-text">Hello World</div>
								<div className="ml-4 text-accent">&lt;/div&gt;</div>
								<div className="ml-2 text-text-muted"> );</div>
								<div className="text-text-muted">&#125;;</div>
							</div>
						</div>

						{/* Palettes Card */}
						<div className="flex flex-col rounded-lg border border-border bg-panel p-6 md:col-span-7">
							<div className="mb-4 flex items-center gap-2">
								<Palette className="size-4 text-text" />
								<span className="font-bold text-sm">Design Tokens</span>
							</div>
							<div className="grid flex-1 grid-cols-4 gap-2">
								<div className="flex items-end rounded border border-border/50 bg-primary p-2 font-mono text-[10px] text-primary-foreground">
									#0D9488
								</div>
								<div className="flex items-end rounded border border-border/50 bg-panel2 p-2 font-mono text-[10px] text-text-muted">
									#E2E8F0
								</div>
								<div className="flex items-end rounded border border-border/50 bg-surface p-2 font-mono text-[10px] text-text-muted">
									#F8FAFC
								</div>
								<div className="flex items-end rounded border border-border/50 bg-text p-2 font-mono text-[10px] text-surface">
									#0F172A
								</div>
							</div>
							<div className="mt-4 flex items-center gap-4">
								<div className="h-2 flex-1 rounded bg-gradient-to-r from-primary via-accent to-text" />
								<span className="font-mono text-[10px] text-text-muted italic">
									gradients.css
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Coming Soon Tools */}
				<section className="border-border border-y bg-panel/30 px-6 py-20">
					<div className="mx-auto max-w-5xl">
						<div className="mb-10 text-center md:text-left">
							<h2 className="font-bold text-lg">Expanding Toolkit</h2>
						</div>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
							{[
								{ icon: <Users className="size-4" />, title: "Collaboration" },
								{ icon: <Layers className="size-4" />, title: "Excalidraw" },
								{ icon: <Palette className="size-4" />, title: "Palettes" },
								{ icon: <Layout className="size-4" />, title: "Web Editor" },
								{ icon: <Cpu className="size-4" />, title: "Logic Gates" },
								{
									icon: <Database className="size-4" />,
									title: "SQL Designer",
								},
							].map((tool, i) => (
								<div
									key={i}
									className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50"
								>
									<div className="text-text-muted">{tool.icon}</div>
									<span className="font-medium text-text-muted text-xs">
										{tool.title}
									</span>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="bg-surface px-6 py-12">
					<div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
						<div className="flex flex-col items-center gap-2 md:items-start">
							<Link
								to="/"
								className="flex items-center gap-2 font-bold text-sm"
							>
								Notebook
							</Link>
						</div>

						{/*<div className="flex gap-6 text-xs text-text-muted font-medium">
							<Link to="/" className="hover:text-text">
								Product
							</Link>
							<Link to="/" className="hover:text-text">
								Privacy
							</Link>
							<Link to="/" className="hover:text-text">
								Terms
							</Link>
						</div>*/}

						<div className="text-text-muted text-xs">
							© {new Date().getFullYear()} Notebook
						</div>
					</div>
				</footer>
			</main>
		</div>
	);
}
