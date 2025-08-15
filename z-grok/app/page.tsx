"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
}

export default function Page() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: "sys-1",
			role: "system",
			content:
				"You are Z Grok, a scientific advisor and curator over GitLab projects. Respect access boundaries."
		}
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [messages]);

	async function onSend() {
		const text = input.trim();
		if (!text) return;
		setInput("");
		const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
		setMessages((m) => [...m, userMsg]);
		setLoading(true);
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: [...messages, userMsg] })
			});
			if (!res.ok) throw new Error("Failed to get response");
			const data = await res.json();
			setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: data.reply }]);
		} catch (err: any) {
			setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: "Error: " + err.message }]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="grid gap-4">
			<div className="text-2xl font-semibold tracking-tight">Chat</div>
			<div
				ref={listRef}
				className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-4 h-[60vh] overflow-y-auto"
			>
				{messages.map((m) => (
					<div key={m.id} className="mb-3">
						<div className="text-xs text-[var(--muted-foreground)] mb-1">
							{m.role === "user" ? "You" : m.role === "assistant" ? "Z Grok" : "System"}
						</div>
						<div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
					</div>
				))}
				{loading && (
					<div className="text-[var(--muted-foreground)] text-sm">Thinking…</div>
				)}
			</div>
			<div className="flex gap-2">
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask about projects, propose ideas, or save README articles…"
				/>
				<Button onClick={onSend} disabled={loading}>
					<Send size={18} /> Send
				</Button>
			</div>
			<div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
				<Lock size={12} />
				AI enforces access boundaries and rejects duplicate projects.
			</div>
		</div>
	);
}