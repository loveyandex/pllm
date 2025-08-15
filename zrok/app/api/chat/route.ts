import { NextRequest, NextResponse } from "next/server";
import { listAccessibleProjects, getProjectReadme, upsertProjectReadme, createProjectIfNovel, enforceAccess } from "@/lib/gitlab";

function classifyIntent(input: string): "query" | "save" | "create" | "other" {
  const t = input.toLowerCase();
  if (/create|new project|spin up|start project/.test(t)) return "create";
  if (/save|update|write.*readme|article|publish/.test(t)) return "save";
  if (/list|search|find|show|what.*projects?|readme/.test(t)) return "query";
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages as Array<{ role: string; content: string }>;
    const last = messages?.[messages.length - 1]?.content || "";
    const intent = classifyIntent(last);
    const centers = (process.env.ALLOWED_CENTER_SLUGS || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (intent === "query") {
      const qMatch = last.match(/readme\s+of\s+(.+)$/i);
      if (qMatch) {
        const search = qMatch[1].trim();
        const found = await listAccessibleProjects({ search, simple: true, per_page: 10 });
        if (found.length === 0) return NextResponse.json({ reply: "No matching projects." });
        const first = found[0];
        if (!(await enforceAccess(first as any, centers))) return NextResponse.json({ reply: "This project is not permitted" });
        const readme = await getProjectReadme(first.id);
        if (!readme) return NextResponse.json({ reply: "This project has no README and thus is not recognized as a valid project." });
        return NextResponse.json({ reply: `# ${first.name}\n\n${readme.content.slice(0, 3000)}` });
      }
      const projects = await listAccessibleProjects({ per_page: 20, simple: true });
      const visible = [] as typeof projects;
      for (const p of projects) {
        if (!(await enforceAccess(p as any, centers))) continue;
        const readme = await getProjectReadme(p.id);
        if (readme?.content) visible.push(p);
      }
      const names = visible.map((p) => `- ${p.path_with_namespace}`).join("\n");
      return NextResponse.json({ reply: visible.length ? `Accessible projects (first ${visible.length}):\n${names}` : "No projects with README found." });
    }
    if (intent === "save") {
      const m = last.match(/save\s+readme\s+for\s+(.+?):\s*[\r\n]+([\s\S]+)$/i);
      if (!m) return NextResponse.json({ reply: "Provide: save README for <project>: <markdown>" });
      const name = m[1].trim();
      const md = m[2].trim();
      const found = await listAccessibleProjects({ search: name, simple: true, per_page: 5 });
      if (found.length === 0) return NextResponse.json({ reply: "Project not found." });
      const first = found[0];
      if (!(await enforceAccess(first as any, centers))) return NextResponse.json({ reply: "This project is not permitted" });
      await upsertProjectReadme(first.id, md);
      return NextResponse.json({ reply: "README saved." });
    }
    if (intent === "create") {
      const m = last.match(/create\s+project\s+"(.+?)"[\s\S]*?summary:\s*([\s\S]+)/i);
      if (!m) return NextResponse.json({ reply: "Provide: create project \"Name\" summary: <text>" });
      const name = m[1].trim();
      const summary = m[2].trim().slice(0, 4000);
      const result = await createProjectIfNovel({ name, ideaSummary: summary });
      if (!result.created) return NextResponse.json({ reply: result.reason || "This project is Reject duplicates  not permitted." });
      return NextResponse.json({ reply: `Created project ${result.project!.path_with_namespace}` });
    }
    return NextResponse.json({ reply: "I can query projects, read/save README, or validate and create new projects. Ask me to: list projects, show README of <name>, save README for <name>: <md>, or create project \"Name\" summary: <text>." });
  } catch (e: any) {
    return NextResponse.json({ reply: `Error: ${e.message}` }, { status: 500 });
  }
}