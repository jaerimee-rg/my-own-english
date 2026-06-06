import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuizMode from "./QuizMode";
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

describe("QuizMode", () => {
  it("asks for more phrases when fewer than two", () => {
    render(<QuizMode phrases={[phrases[0]]} />);
    expect(screen.getByText(/2개 이상일 때/)).toBeInTheDocument();
  });

  it("scores a correct pick and advances to results", async () => {
    render(<QuizMode phrases={phrases} />);
    expect(screen.getByTestId("quiz-progress")).toHaveTextContent("1 / 3");

    // Answer every question correctly by reading the prompt's matching English.
    for (let i = 0; i < phrases.length; i++) {
      const koreanText = screen.getByTestId("quiz-prompt").textContent!;
      const correct = phrases.find((p) => p.korean === koreanText)!.english;
      await userEvent.click(screen.getByRole("button", { name: correct }));
      await userEvent.click(
        screen.getByRole("button", { name: /다음 문제|결과 보기/ }),
      );
    }

    expect(screen.getByText(/3개 정답/)).toBeInTheDocument();
  });
});
