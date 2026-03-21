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
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAppContext } from "@/providers/app-provider";

export default function Landing() {
	const { isDark, toggleMode } = useAppContext();

	return (
		<div className="h-dvh overflow-y-auto scroll-smooth bg-white font-sans text-zinc-900 tracking-tight dark:bg-zinc-950 dark:text-zinc-100">
			{/* Navigation */}
			<header className="sticky top-0 z-50 flex h-14 items-center justify-between border-zinc-200 border-b bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
				<Link
					to="/"
					className="flex items-center gap-2 font-bold text-lg text-zinc-900 transition-opacity hover:opacity-80 dark:text-zinc-100"
				>
					<span>Notebook</span>
				</Link>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleMode}
						className="rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
				<section className="mx-auto flex max-w-4xl flex-col items-center border-zinc-200/50 border-b px-6 py-20 text-center md:py-32 dark:border-zinc-800/50">
					<div className="mb-8 inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 font-medium text-zinc-500 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
						<Sparkles className="size-3" />
						<span>All-in-one technical toolkit</span>
					</div>
					<h1 className="mb-6 font-bold text-4xl text-zinc-900 tracking-tighter md:text-6xl dark:text-zinc-100">
						The workspace for <br />
						<span className="text-teal-600 dark:text-teal-400">
							useful tools.
						</span>
					</h1>
					<p className="mb-10 max-w-2xl text-lg text-zinc-500 leading-relaxed dark:text-zinc-400">
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
				<section className="border-zinc-200 border-b bg-white px-6 py-20 dark:border-zinc-800 dark:bg-zinc-950">
					<div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
						{[
							{
								icon: (
									<Wrench className="size-5 text-teal-600 dark:text-teal-400" />
								),
								title: "Unified Collection",
								desc: "Mermaid diagrams, code editors, and more in one interface.",
							},
							{
								icon: (
									<Save className="size-5 text-zinc-900 dark:text-zinc-100" />
								),
								title: "Instant Auto-Save",
								desc: "Never lose a thought. Every change is persisted as you type.",
							},
							{
								icon: (
									<Share2 className="size-5 text-zinc-900 dark:text-zinc-100" />
								),
								title: "Easy Sharing",
								desc: "Generate links and collaborate with your team effortlessly.",
							},
						].map((item, i) => (
							<Card
								key={i}
								className="rounded-lg border border-zinc-200 bg-transparent p-0 shadow-none dark:border-zinc-800"
							>
								<CardHeader className="p-6">
									<div className="mb-4 w-fit rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900">
										{item.icon}
									</div>
									<CardTitle className="font-bold text-lg">
										{item.title}
									</CardTitle>
									<CardDescription className="mt-2 text-sm text-zinc-500 leading-relaxed dark:text-zinc-400">
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
						<p className="text-zinc-500 dark:text-zinc-400">
							One workspace for every technical need.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
						{/* Mermaid Card */}
						<div className="flex min-h-[300px] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-6 md:col-span-8 dark:border-zinc-800 dark:bg-zinc-900">
							<div className="mb-4 flex items-center gap-2">
								<Zap className="size-4 text-teal-600 dark:text-teal-400" />
								<span className="font-bold text-sm">Mermaid Diagrams</span>
							</div>
							<div className="flex-1 rounded border border-zinc-200/50 bg-white p-4 font-mono text-zinc-500 text-xs dark:border-zinc-800/50 dark:bg-zinc-950 dark:text-zinc-400">
								<div className="text-teal-600 italic dark:text-teal-400">
									graph TD
								</div>
								<div className="ml-2">A[User] --&gt; B&#123;Auth&#125;</div>
								<div className="ml-2">B -- Yes --&gt; C[Dashboard]</div>
								<div className="ml-2">B -- No --&gt; D[Login]</div>
								<div className="mt-4 flex flex-col items-center border-zinc-200/30 border-t pt-4 dark:border-zinc-800/30">
									<div className="flex h-12 w-12 items-center justify-center rounded-full border border-teal-600/40 text-[10px] dark:border-teal-400/40">
										User
									</div>
									<div className="h-6 w-px bg-teal-600/40 dark:bg-teal-400/40" />
									<div className="rounded border border-teal-600/40 px-3 py-1 text-[10px] italic dark:border-teal-400/40">
										Auth?
									</div>
								</div>
							</div>
						</div>

						{/* Folders Card */}
						<div className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50 p-6 md:col-span-4 dark:border-zinc-800 dark:bg-zinc-900">
							<div className="mb-4 flex items-center gap-2">
								<FolderTree className="size-4 text-zinc-900 dark:text-zinc-100" />
								<span className="font-bold text-sm">Structure</span>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2 rounded border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950">
									<FolderTree className="size-3 text-zinc-500 dark:text-zinc-400" />
									<span>System Architecture</span>
								</div>
								<div className="ml-4 flex items-center gap-2 rounded border border-zinc-200 bg-white/50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950/50">
									<Layout className="size-3 text-zinc-500 dark:text-zinc-400" />
									<span>Database Schema</span>
								</div>
								<div className="ml-4 flex items-center gap-2 rounded border border-zinc-200 bg-white/50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950/50">
									<Zap className="size-3 text-zinc-500 dark:text-zinc-400" />
									<span>API Flows</span>
								</div>
								<div className="flex items-center gap-2 rounded border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950">
									<Palette className="size-3 text-zinc-500 dark:text-zinc-400" />
									<span>UI Guidelines</span>
								</div>
							</div>
						</div>

						{/* Code Editor Card */}
						<div className="flex h-[240px] flex-col rounded-lg border border-zinc-200 bg-zinc-50 p-6 md:col-span-5 dark:border-zinc-800 dark:bg-zinc-900">
							<div className="mb-4 flex items-center gap-2">
								<Code2 className="size-4 text-zinc-900 dark:text-zinc-100" />
								<span className="font-bold text-sm">Web Editor</span>
							</div>
							<div className="flex-1 rounded border border-zinc-200 bg-white p-4 font-mono text-[11px] leading-relaxed dark:border-zinc-800 dark:bg-zinc-950">
								<div className="text-zinc-500 dark:text-zinc-400">
									<span className="text-teal-600 dark:text-teal-400">
										const
									</span>{" "}
									app = () =&gt; &#123;
								</div>
								<div className="ml-2 text-zinc-500 dark:text-zinc-400">
									{" "}
									<span className="text-teal-600 dark:text-teal-400">
										return
									</span>{" "}
									(
								</div>
								<div className="ml-4 text-teal-600 dark:text-teal-400">
									&lt;div className="p-4"&gt;
								</div>
								<div className="ml-6 text-zinc-900 dark:text-zinc-100">
									Hello World
								</div>
								<div className="ml-4 text-teal-600 dark:text-teal-400">
									&lt;/div&gt;
								</div>
								<div className="ml-2 text-zinc-500 dark:text-zinc-400"> );</div>
								<div className="text-zinc-500 dark:text-zinc-400">&#125;;</div>
							</div>
						</div>

						{/* Palettes Card */}
						<div className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50 p-6 md:col-span-7 dark:border-zinc-800 dark:bg-zinc-900">
							<div className="mb-4 flex items-center gap-2">
								<Palette className="size-4 text-zinc-900 dark:text-zinc-100" />
								<span className="font-bold text-sm">Design Tokens</span>
							</div>
							<div className="grid flex-1 grid-cols-4 gap-2">
								<div className="flex items-end rounded border border-zinc-200/50 bg-teal-600 p-2 font-mono text-[10px] text-white dark:bg-teal-500">
									#0D9488
								</div>
								<div className="flex items-end rounded border border-zinc-200/50 bg-zinc-100 p-2 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
									#E2E8F0
								</div>
								<div className="flex items-end rounded border border-zinc-200/50 bg-white p-2 font-mono text-[10px] text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
									#F8FAFC
								</div>
								<div className="flex items-end rounded border border-zinc-200/50 bg-zinc-900 p-2 font-mono text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-950">
									#0F172A
								</div>
							</div>
							<div className="mt-4 flex items-center gap-4">
								<div className="h-2 flex-1 rounded bg-gradient-to-r from-teal-600 via-teal-400 to-zinc-900 dark:from-teal-500 dark:via-teal-300 dark:to-zinc-100" />
								<span className="font-mono text-[10px] text-zinc-500 italic dark:text-zinc-400">
									gradients.css
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Coming Soon Tools */}
				<section className="border-zinc-200 border-y bg-zinc-50/30 px-6 py-20 dark:border-zinc-800 dark:bg-zinc-900/30">
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
									className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-teal-600/50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-teal-400/50"
								>
									<div className="text-zinc-500 dark:text-zinc-400">
										{tool.icon}
									</div>
									<span className="font-medium text-zinc-500 text-xs dark:text-zinc-400">
										{tool.title}
									</span>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="bg-white px-6 py-12 dark:bg-zinc-950">
					<div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
						<div className="flex flex-col items-center gap-2 md:items-start">
							<Link
								to="/"
								className="flex items-center gap-2 font-bold text-sm"
							>
								Notebook
							</Link>
						</div>

						{/*<div className="flex gap-6 text-xs text-zinc-500 font-medium">
							<Link to="/" className="hover:text-zinc-900">
								Product
							</Link>
							<Link to="/" className="hover:text-zinc-900">
								Privacy
							</Link>
							<Link to="/" className="hover:text-zinc-900">
								Terms
							</Link>
						</div>*/}

						<div className="text-zinc-500 text-xs dark:text-zinc-400">
							© {new Date().getFullYear()} Notebook
						</div>
					</div>
				</footer>
			</main>
		</div>
	);
}
