// Text-to-speech via the browser Web Speech API (Phase 1).
// No external service — works offline on supported browsers.

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

/**
 * Speak the given text aloud. Cancels any in-progress utterance first.
 * Returns true if speech was started, false if unsupported or empty.
 */
export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSupported()) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = options.lang ?? "en-US";
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1;
  synth.speak(utterance);
  return true;
}

/** Stop any in-progress speech. */
export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
