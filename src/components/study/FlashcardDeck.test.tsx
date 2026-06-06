import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlashcardDeck from "./FlashcardDeck";
import type { Phrase } from "@/lib/phrases/types";

vi.mock("@/lib/tts", () => ({ speak: vi.fn() }));

function mk(id: string, english: string, korean: string): Phrase {
  return {
    id,
    user_id: "u",
    english,
    korean,
    note: null,
    apparatus: null,
    situation: null,
    level: null,
    is_favorite: false,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };
}

const deck = [mk("1", "Point your toes", "발끝"), mk("2", "Great job", "잘했어요")];

describe("FlashcardDeck", () => {
  it("shows empty message when no phrases", () => {
    render(<FlashcardDeck phrases={[]} />);
    expect(screen.getByText(/학습할 문장이 없어요/)).toBeInTheDocument();
  });

  it("flips between english and korean", async () => {
    render(<FlashcardDeck phrases={deck} />);
    expect(screen.getByText("Point your toes")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "카드 뒤집기" }));
    expect(screen.getByText("발끝")).toBeInTheDocument();
  });

  it("navigates between cards and tracks progress", async () => {
    render(<FlashcardDeck phrases={deck} />);
    expect(screen.getByTestId("progress")).toHaveTextContent("1 / 2");
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByText("Great job")).toBeInTheDocument();
    expect(screen.getByTestId("progress")).toHaveTextContent("2 / 2");
    // 다음 is disabled at the end
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("disables 이전 on the first card", () => {
    render(<FlashcardDeck phrases={deck} />);
    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
  });
});
