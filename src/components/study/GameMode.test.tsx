import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameMode from "./GameMode";
import type { Phrase } from "@/lib/phrases/types";

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

const phrases = [
  mk("1", "Point your toes", "발끝을 펴세요"),
  mk("2", "Spin the hoop", "후프를 돌려요"),
  mk("3", "Great job", "잘했어요"),
];

describe("GameMode", () => {
  it("requires at least two phrases", () => {
    render(<GameMode phrases={[phrases[0]]} />);
    expect(screen.getByText(/2개 이상일 때/)).toBeInTheDocument();
  });

  it("builds streak and score on correct answers and shows badges", async () => {
    render(<GameMode phrases={phrases} />);

    for (let i = 0; i < phrases.length; i++) {
      const korean = screen.getByTestId("game-prompt").textContent!;
      const correct = phrases.find((p) => p.korean === korean)!.english;
      await userEvent.click(screen.getByRole("button", { name: correct }));
      await userEvent.click(
        screen.getByRole("button", { name: /다음|결과 보기/ }),
      );
    }

    // 3 correct in a row → score > 0 and a 3연속 badge.
    expect(screen.getByText(/점$/)).toBeInTheDocument();
    expect(screen.getByTestId("badges")).toHaveTextContent("3연속");
  });
});
