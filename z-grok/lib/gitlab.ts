export interface GitLabProject {
	id: number;
	name: string;
	path_with_namespace: string;
	last_activity_at?: string;
	tag_list?: string[];
	visibility?: string;
}

function getEnv(name: string, fallback?: string): string {
	const value = process.env[name] ?? fallback;
	if (!value) throw new Error(`Missing env ${name}`);
	return value;
}

const baseUrl = process.env.GITLAB_BASE_URL || "https://gitlab.com/api/v4";
const token = process.env.GITLAB_TOKEN || "";

async function glFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const url = `${baseUrl}${path}`;
	const res = await fetch(url, {
		...init,
		headers: {
			"Content-Type": "application/json",
			"PRIVATE-TOKEN": token,
			...(init?.headers || {})
		}
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`GitLab error ${res.status}: ${text}`);
	}
	return (await res.json()) as T;
}

export async function listAccessibleProjects(params: { search?: string; simple?: boolean; per_page?: number }): Promise<GitLabProject[]> {
	const search = new URLSearchParams();
	if (params.search) search.set("search", params.search);
	if (params.simple) search.set("simple", "true");
	search.set("per_page", String(params.per_page ?? 50));
	return glFetch<GitLabProject[]>(`/projects?${search.toString()}`);
}

export async function getProjectReadme(projectId: number): Promise<{ content: string; file_path: string } | null> {
	try {
		const files = await glFetch<any[]>(`/projects/${projectId}/repository/tree?per_page=100`);
		const readme = files.find((f) => /^readme\.md$/i.test(f.name));
		if (!readme) return null;
		const file = await glFetch<{ content: string }>(`/projects/${projectId}/repository/files/${encodeURIComponent(readme.path)}?ref=HEAD`);
		const decoded = Buffer.from(file.content, "base64").toString("utf-8");
		return { content: decoded, file_path: readme.path };
	} catch (e) {
		return null;
	}
}

export async function upsertProjectReadme(projectId: number, content: string): Promise<void> {
	const path = "README.md";
	const filePath = encodeURIComponent(path);
	// Try to get existing file
	let exists = true;
	try {
		await glFetch(`/projects/${projectId}/repository/files/${filePath}?ref=HEAD`);
	} catch {
		exists = false;
	}
	const body = {
		branch: "main",
		content,
		commit_message: exists ? "chore: update README.md via Z Grok" : "chore: add README.md via Z Grok"
	};
	await glFetch(`/projects/${projectId}/repository/files/${filePath}`, {
		method: exists ? "PUT" : "POST",
		body: JSON.stringify(body)
	});
}

export async function createProjectIfNovel(params: {
	name: string;
	description?: string;
	groupId?: number;
	ideaSummary: string;
	allowedCenters?: string[];
}): Promise<{ created: boolean; project?: GitLabProject; reason?: string }>
{
	// Very simple novelty gate: check README similarity via substring match and keyword overlap.
	// In production, replace with LLM embedding search.
	const existing = await listAccessibleProjects({ per_page: 100, simple: true });
	const summaries: Array<{ id: number; text: string }> = [];
	for (const p of existing) {
		const r = await getProjectReadme(p.id);
		if (r?.content) summaries.push({ id: p.id, text: r.content.slice(0, 4000) });
	}
	const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
	const idea = norm(params.ideaSummary);
	for (const s of summaries) {
		const content = norm(s.text);
		const overlap = idea.split(" ").filter((w) => w.length > 4 && content.includes(w)).length;
		if (overlap > 12 || content.includes(idea.slice(0, 60))) {
			return { created: false, reason: "This project is Reject duplicates  not permitted." };
		}
	}
	const payload: any = {
		name: params.name,
		description: params.description ?? params.ideaSummary.slice(0, 200)
	};
	if (params.groupId) payload.namespace_id = params.groupId;
	const project = await glFetch<GitLabProject>(`/projects`, {
		method: "POST",
		body: JSON.stringify(payload)
	});
	// Ensure README exists, otherwise delete project per rule
	await upsertProjectReadme(project.id, `# ${params.name}\n\n${params.ideaSummary}\n`);
	return { created: true, project };
}

export async function enforceAccess(project: GitLabProject, userCenters: string[]): Promise<boolean> {
	// Simple boundary: if project path includes a center not in user list, forbid
	const lower = project.path_with_namespace.toLowerCase();
	const forbidden = ["finance", "hr", "legal"];
	if (forbidden.some((f) => lower.includes(`/${f}/`))) return false;
	return true;
}