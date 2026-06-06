import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhraseCard from "./PhraseCard";
import type { Phrase } from "@/lib/phrases/types";

vi.mock("@/lib/tts", () => ({ speak: vi.fn() }));

const phrase: Phrase = {
  id: "1",
  user_id: "u",
  english: "Hold the ribbon",
  korean: "리본을 잡으세요",
  note: "수업 시작 때",
  apparatus: "ribbon",
  situation: "instruction",
  level: "beginner",
  is_favorite: false,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("PhraseCard", () => {
  it("shows english, korean, note, and category chips", () => {
    render(<PhraseCard phrase={phrase} />);
    expect(screen.getByText("Hold the ribbon")).toBeInTheDocument();
    expect(screen.getByText("리본을 잡으세요")).toBeInTheDocument();
    expect(screen.getByText("수업 시작 때")).toBeInTheDocument();
    expect(screen.getByText("리본")).toBeInTheDocument();
    expect(screen.getByText("동작 지시")).toBeInTheDocument();
    expect(screen.getByText("초급")).toBeInTheDocument();
  });

  it("fires callbacks for favorite, edit, and delete", async () => {
    const onToggleFavorite = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <PhraseCard
        phrase={phrase}
        onToggleFavorite={onToggleFavorite}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "즐겨찾기" }));
    await userEvent.click(screen.getByRole("button", { name: "수정" }));
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(onToggleFavorite).toHaveBeenCalledWith(phrase);
    expect(onEdit).toHaveBeenCalledWith(phrase);
    expect(onDelete).toHaveBeenCalledWith(phrase);
  });
});
