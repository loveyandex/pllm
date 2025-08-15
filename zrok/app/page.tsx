"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg, { id: crypto.randomUUID(), role: "assistant", content: "" }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      if (!res.ok || !res.body) throw new Error("Failed to get response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) buffer += decoder.decode(value, { stream: true });
        if (buffer) {
          setMessages((m) => {
            const copy = [...m];
            const lastIdx = copy.length - 1;
            copy[lastIdx] = { ...copy[lastIdx], content: buffer };
            return copy;
          });
        }
      }
    } catch (err: any) {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function onSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await send(text);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 grid gap-4">
      <div className="text-lg font-semibold tracking-tight">Chat</div>
      <div ref={listRef} className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 h-[60vh] overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={
              m.role === "user"
                ? "max-w-[80%] rounded-lg bg-neutral-800 text-neutral-100 px-3 py-2"
                : m.role === "assistant"
                ? "max-w-[80%] rounded-lg bg-neutral-900 text-neutral-100 px-3 py-2"
                : "max-w-[80%] rounded-lg border border-neutral-800 text-neutral-300 px-3 py-2"
            }>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-neutral-500 text-sm">Thinking…</div>
        )}
      </div>
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about projects, propose ideas, or save README articles… (Shift+Enter = newline)"
          className="min-h-[56px]"
        />
        <Button onClick={onSend} disabled={loading} className="h-[56px] px-5">Send</Button>
      </div>
      <div className="text-xs text-neutral-500">
        Enter to send. Shift+Enter for newline.
      </div>
    </div>
  );
}
