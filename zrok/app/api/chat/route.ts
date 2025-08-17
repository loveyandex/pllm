import { NextRequest } from "next/server";
import { listAccessibleProjects, getProjectReadme, upsertProjectReadme, createProjectIfNovel, enforceAccess } from "@/lib/gitlab";

function classifyIntent(input: string): "query" | "save" | "create" | "other" {
  const t = input.toLowerCase();
  if (/create|new project|spin up|start project/.test(t)) return "create";
  if (/save|update|write.*readme|article|publish/.test(t)) return "save";
  if (/list|search|find|show|what.*projects?|readme/.test(t)) return "query";
  return "other";
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const { messages } = await req.json();
  const last = messages?.[messages.length - 1]?.content || "";
  const intent = classifyIntent(last);
  const centers = (process.env.ALLOWED_CENTER_SLUGS || "").split(",").map((s) => s.trim()).filter(Boolean);

  async function streamQuery() {
    const qMatch = last.match(/readme\s+of\s+(.+)$/i);
    if (qMatch) {
      const search = qMatch[1].trim();
      const found = await listAccessibleProjects({ search, simple: true, per_page: 10 });
      if (found.length === 0) return `No matching projects.`;
      const first = found[0];
      if (!(await enforceAccess(first as any, centers))) return `This project is not permitted`;
      const readme = await getProjectReadme(first.id);
      if (!readme) return `This project has no README and thus is not recognized as a valid project.`;
      return `# ${first.name}\n\n${readme.content.slice(0, 3000)}`;
    }
    const projects = await listAccessibleProjects({ per_page: 20, simple: true });
    const visible = [] as typeof projects;
    for (const p of projects) {
      if (!(await enforceAccess(p as any, centers))) continue;
      const readme = await getProjectReadme(p.id);
      if (readme?.content) visible.push(p);
    }
    const names = visible.map((p) => `- ${p.path_with_namespace}`).join("\n");
    return visible.length ? `Accessible projects (first ${visible.length}):\n${names}` : "No projects with README found.";
  }

  async function streamSave() {
    const m = last.match(/save\s+readme\s+for\s+(.+?):\s*[\r\n]+([\s\S]+)$/i);
    if (!m) return `Provide: save README for <project>: <markdown>`;
    const name = m[1].trim();
    const md = m[2].trim();
    const found = await listAccessibleProjects({ search: name, simple: true, per_page: 5 });
    if (found.length === 0) return `Project not found.`;
    const first = found[0];
    if (!(await enforceAccess(first as any, centers))) return `This project is not permitted`;
    await upsertProjectReadme(first.id, md);
    return `README saved.`;
  }

  async function streamCreate() {
    const m = last.match(/create\s+project\s+"(.+?)"[\s\S]*?summary:\s*([\s\S]+)/i);
    if (!m) return `Provide: create project \"Name\" summary: <text>`;
    const name = m[1].trim();
    const summary = m[2].trim().slice(0, 4000);
    const result = await createProjectIfNovel({ name, ideaSummary: summary });
    if (!result.created) return result.reason || `This project is Reject duplicates  not permitted.`;
    return `Created project ${result.project!.path_with_namespace}`;
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const prelude = `Intent: ${intent}\n`;
      controller.enqueue(encoder.encode(prelude));
      try {
        let answer = "";
        if (intent === "query") answer = await streamQuery();
        else if (intent === "save") answer = await streamSave();
        else if (intent === "create") answer = await streamCreate();
        else answer = "I can query projects, read/save README, or validate and create new projects.";
        for (const chunk of answer.split("").reduce<string[]>((arr, ch, idx) => {
          const last = arr[arr.length - 1];
          if (!last || last.length > 80) arr.push(ch);
          else arr[arr.length - 1] = last + ch;
          return arr;
        }, [])) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise((r) => setTimeout(r, 5));
        }
      } catch (e: any) {
        controller.enqueue(encoder.encode(`Error: ${e.message}`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}