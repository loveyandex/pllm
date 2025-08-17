import { NextRequest, NextResponse } from "next/server";
import { createProjectIfNovel } from "@/lib/gitlab";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const name = String(body.name || "").trim();
		const ideaSummary = String(body.ideaSummary || "").trim();
		const groupId = body.groupId ? Number(body.groupId) : undefined;
		if (!name || !ideaSummary) return NextResponse.json({ error: "name and ideaSummary required" }, { status: 400 });
		const result = await createProjectIfNovel({ name, ideaSummary, groupId });
		if (!result.created) return NextResponse.json({ error: result.reason || "This project is Reject duplicates  not permitted." }, { status: 403 });
		return NextResponse.json({ project: result.project });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}