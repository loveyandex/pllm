import { NextRequest, NextResponse } from "next/server";
import { listAccessibleProjects, enforceAccess, getProjectReadme } from "@/lib/gitlab";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const perPage = Number(searchParams.get("limit") || 50);
    const centers = (process.env.ALLOWED_CENTER_SLUGS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const projects = await listAccessibleProjects({ search, per_page: perPage, simple: true });
    const filtered: any[] = [];
    for (const p of projects) {
      if (!(await enforceAccess(p as any, centers))) continue;
      const readme = await getProjectReadme(p.id);
      if (readme?.content) filtered.push(p);
    }
    return NextResponse.json({ projects: filtered });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}