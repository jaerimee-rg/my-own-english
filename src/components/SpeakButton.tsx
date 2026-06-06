"use client";

import { speak } from "@/lib/tts";

/** Small button that reads an English phrase aloud via the Web Speech API. */
export default function SpeakButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="발음 듣기"
      title="발음 듣기"
      onClick={() => speak(text)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-pink-600 transition hover:bg-pink-50 active:scale-95 dark:text-pink-400 dark:hover:bg-pink-950/40 ${className}`}
    >
      <span aria-hidden>🔊</span>
    </button>
  );
}
