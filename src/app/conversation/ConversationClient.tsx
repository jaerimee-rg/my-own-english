"use client";

import { useState } from "react";
import { SCENARIOS, getScenario } from "@/lib/conversation/scenarios";
import type { ChatMessage } from "@/lib/conversation/chat";
import SpeakButton from "@/components/SpeakButton";

export default function ConversationClient() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scenario = scenarioId ? getScenario(scenarioId) : undefined;

  async function send() {
    const text = input.trim();
    if (!text || loading || !scenarioId) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, scenarioId }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "(응답 없음)",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "연결에 문제가 있었어요." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!scenario) {
    return (
      <div>
        <header className="mb-6">
          <h1 className="text-2xl font-bold">대화 연습</h1>
          <p className="text-sm text-neutral-500">상황을 골라 영어로 대화해요</p>
        </header>
        <ul className="flex flex-col gap-3">
          {SCENARIOS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  setScenarioId(s.id);
                  setMessages([]);
                }}
                className="w-full rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm dark:border-white/10 dark:bg-neutral-900"
              >
                <p className="font-semibold">{s.label}</p>
                <p className="text-sm text-neutral-500">{s.description}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70dvh] flex-col">
      <button
        type="button"
        onClick={() => setScenarioId(null)}
        className="mb-3 text-sm text-neutral-500"
      >
        ← 상황 선택
      </button>
      <h1 className="mb-4 text-xl font-bold">{scenario.label}</h1>

      <ul className="flex flex-1 flex-col gap-2">
        {messages.length === 0 && (
          <li className="py-8 text-center text-sm text-neutral-400">
            먼저 영어로 말을 걸어보세요. 예: “Hello! Are you ready?”
          </li>
        )}
        {messages.map((m, i) => (
          <li
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <span
              className={`inline-flex max-w-[80%] items-center gap-1 rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-pink-600 text-white"
                  : "bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
              }`}
            >
              {m.content}
              {m.role === "assistant" && <SpeakButton text={m.content} />}
            </span>
          </li>
        ))}
        {loading && (
          <li className="text-sm text-neutral-400">상대가 입력 중…</li>
        )}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          aria-label="메시지"
          className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="영어로 입력…"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading}
          className="rounded-xl bg-pink-600 px-4 font-semibold text-white disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </div>
  );
}
