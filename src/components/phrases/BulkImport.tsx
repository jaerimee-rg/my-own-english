"use client";

import { useState } from "react";
import type { PhraseInput } from "@/lib/phrases/types";

export default function BulkImport({
  onSave,
  onClose,
}: {
  onSave: (phrases: PhraseInput[]) => Promise<void>;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<PhraseInput[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function analyze() {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true);
    setNote(null);
    try {
      const res = await fetch("/api/parse-phrases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as {
        phrases?: PhraseInput[];
        source?: string;
      };
      const parsed = data.phrases ?? [];
      setRows(parsed);
      setNote(
        parsed.length === 0
          ? "문장을 찾지 못했어요. 형식(영어 - 한국어, 또는 줄 바꿈)을 확인해 주세요."
          : `${parsed.length}개 문장을 찾았어요${
              data.source === "ai" ? " (AI 정리)" : ""
            }. 확인 후 저장하세요.`,
      );
    } catch {
      setNote("분석에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setAnalyzing(false);
    }
  }

  function edit(i: number, key: "english" | "korean", value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  }

  function remove(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function save() {
    const valid = rows.filter((r) => r.english.trim() && r.korean.trim());
    if (valid.length === 0 || saving) return;
    setSaving(true);
    try {
      await onSave(valid);
      onClose();
    } catch {
      setNote("저장에 실패했어요. 로그인 상태를 확인해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">문장 일괄 추가</h2>
        <button type="button" onClick={onClose} className="text-sm text-neutral-500">
          닫기
        </button>
      </div>

      <p className="text-xs text-neutral-400">
        영어·한국어가 섞인 문장을 붙여넣고 “분석”을 누르세요. (예: “Point your toes. - 발끝을
        펴세요.” 또는 영어줄/한국어줄 번갈아)
      </p>

      <textarea
        aria-label="일괄 입력"
        className="min-h-32 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Point your toes. - 발끝을 펴세요.\nGreat job! - 잘했어요!"}
      />

      <button
        type="button"
        onClick={analyze}
        disabled={analyzing || !text.trim()}
        className="rounded-xl border border-pink-300 py-2 text-sm font-semibold text-pink-700 disabled:opacity-40 dark:border-pink-800 dark:text-pink-300"
      >
        {analyzing ? "분석 중…" : "🔎 분석"}
      </button>

      {note && <p className="text-xs text-neutral-500">{note}</p>}

      {rows.length > 0 && (
        <ul className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <li
              key={i}
              className="flex flex-col gap-1 rounded-xl border border-black/5 bg-white p-2 dark:border-white/10 dark:bg-neutral-900"
            >
              <input
                aria-label={`영어 ${i + 1}`}
                className={field}
                value={row.english}
                onChange={(e) => edit(i, "english", e.target.value)}
              />
              <div className="flex gap-1">
                <input
                  aria-label={`한국어 ${i + 1}`}
                  className={field}
                  value={row.korean}
                  onChange={(e) => edit(i, "korean", e.target.value)}
                />
                <button
                  type="button"
                  aria-label={`삭제 ${i + 1}`}
                  onClick={() => remove(i)}
                  className="shrink-0 rounded-lg px-2 text-red-500"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-pink-600 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "저장 중…" : `${rows.length}개 문장 저장`}
        </button>
      )}
    </div>
  );
}
