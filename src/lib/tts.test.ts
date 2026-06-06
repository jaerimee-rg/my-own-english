import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { speak, stopSpeaking, isSpeechSupported } from "./tts";

describe("tts", () => {
  const speakMock = vi.fn();
  const cancelMock = vi.fn();

  beforeEach(() => {
    speakMock.mockClear();
    cancelMock.mockClear();
    vi.stubGlobal("speechSynthesis", { speak: speakMock, cancel: cancelMock });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        text: string;
        lang = "";
        rate = 1;
        pitch = 1;
        constructor(text: string) {
          this.text = text;
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports support when speechSynthesis exists", () => {
    expect(isSpeechSupported()).toBe(true);
  });

  it("speaks trimmed, non-empty text and cancels first", () => {
    const ok = speak("  Point your toes  ");
    expect(ok).toBe(true);
    expect(cancelMock).toHaveBeenCalledOnce();
    expect(speakMock).toHaveBeenCalledOnce();
    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.text).toBe("Point your toes");
    expect(utterance.lang).toBe("en-US");
  });

  it("does not speak empty text", () => {
    expect(speak("   ")).toBe(false);
    expect(speakMock).not.toHaveBeenCalled();
  });

  it("stopSpeaking cancels", () => {
    stopSpeaking();
    expect(cancelMock).toHaveBeenCalledOnce();
  });
});
