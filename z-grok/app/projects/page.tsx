"use client";

import { useEffect, useState } from "react";
import { FolderGit2 } from "lucide-react";

interface Project {
	id: number;
	name: string;
	path_with_namespace: string;
	last_activity_at?: string;
}

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/projects?limit=50");
				if (!res.ok) throw new Error("Failed to load projects");
				const data = await res.json();
				setProjects(data.projects || []);
			} catch (e: any) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<div className="grid gap-4">
			<div className="text-2xl font-semibold tracking-tight">Projects</div>
			{loading ? (
				<div className="text-[var(--muted-foreground)]">Loading…</div>
			) : error ? (
				<div className="text-red-400">{error}</div>
			) : (
				<div className="grid gap-2">
					{projects.length === 0 && (
						<div className="text-[var(--muted-foreground)]">No projects found.</div>
					)}
					{projects.map((p) => (
						<div key={p.id} className="rounded-md border border-[var(--border)] bg-[var(--muted)]/40 p-3 flex items-center gap-3">
							<FolderGit2 size={18} className="text-[var(--muted-foreground)]" />
							<div className="flex-1">
								<div className="font-medium">{p.name}</div>
								<div className="text-xs text-[var(--muted-foreground)]">{p.path_with_namespace}</div>
							</div>
							{p.last_activity_at && (
								<div className="text-xs text-[var(--muted-foreground)]">{new Date(p.last_activity_at).toLocaleString()}</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}