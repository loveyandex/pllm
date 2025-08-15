import { NextRequest, NextResponse } from "next/server";
import { getProjectReadme, upsertProjectReadme } from "@/lib/gitlab";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = Number(searchParams.get("projectId"));
		if (!id) return NextResponse.json({ error: "projectId required" }, { status: 400 });
		const readme = await getProjectReadme(id);
		return NextResponse.json({ readme });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const id = Number(body.projectId);
		const content = String(body.content || "");
		if (!id || !content) return NextResponse.json({ error: "projectId and content required" }, { status: 400 });
		await upsertProjectReadme(id, content);
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}