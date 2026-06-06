import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlankQuizMode from "./BlankQuizMode";
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

describe("BlankQuizMode", () => {
  it("shows empty state without phrases", () => {
    render(<BlankQuizMode phrases={[]} />);
    expect(screen.getByText(/학습할 문장이 없어요/)).toBeInTheDocument();
  });

  it("accepts a correct answer and reaches results", async () => {
    render(<BlankQuizMode phrases={[mk("1", "Point your toes", "발끝")]} />);
    // "Point" is the longest word → blanked.
    expect(screen.getByTestId("blank-masked")).toHaveTextContent("____ your toes");

    await userEvent.type(screen.getByLabelText("빈칸 답"), "point");
    await userEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(screen.getByRole("status")).toHaveTextContent("정답");

    await userEvent.click(screen.getByRole("button", { name: "결과 보기" }));
    expect(screen.getByText(/1개 정답/)).toBeInTheDocument();
  });

  it("marks a wrong answer and reveals the correct word", async () => {
    render(<BlankQuizMode phrases={[mk("1", "Great job", "잘했어요")]} />);
    await userEvent.type(screen.getByLabelText("빈칸 답"), "nope");
    await userEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(screen.getByRole("status")).toHaveTextContent("Great");
  });
});
