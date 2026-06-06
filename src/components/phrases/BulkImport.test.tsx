import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BulkImport from "./BulkImport";

afterEach(() => vi.unstubAllGlobals());

function mockParse(phrases: { english: string; korean: string }[], source = "local") {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ json: async () => ({ phrases, source }) }),
  );
}

describe("BulkImport", () => {
  it("analyzes pasted text and previews rows", async () => {
    mockParse([
      { english: "Point your toes.", korean: "발끝을 펴세요." },
      { english: "Great job!", korean: "잘했어요!" },
    ]);
    render(<BulkImport onSave={vi.fn()} onClose={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("일괄 입력"), "some text");
    await userEvent.click(screen.getByRole("button", { name: /분석/ }));

    expect(await screen.findByText(/2개 문장을 찾았어요/)).toBeInTheDocument();
    expect(screen.getByLabelText("영어 1")).toHaveValue("Point your toes.");
    expect(screen.getByLabelText("한국어 2")).toHaveValue("잘했어요!");
  });

  it("removes a row and saves the rest", async () => {
    mockParse([
      { english: "A", korean: "가" },
      { english: "B", korean: "나" },
    ]);
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<BulkImport onSave={onSave} onClose={onClose} />);

    await userEvent.type(screen.getByLabelText("일괄 입력"), "x");
    await userEvent.click(screen.getByRole("button", { name: /분석/ }));
    await screen.findByLabelText("영어 1");

    await userEvent.click(screen.getByRole("button", { name: "삭제 2" }));
    await userEvent.click(screen.getByRole("button", { name: /1개 문장 저장/ }));

    expect(onSave).toHaveBeenCalledWith([{ english: "A", korean: "가" }]);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows a message when nothing is found", async () => {
    mockParse([]);
    render(<BulkImport onSave={vi.fn()} onClose={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("일괄 입력"), "junk");
    await userEvent.click(screen.getByRole("button", { name: /분석/ }));
    expect(await screen.findByText(/문장을 찾지 못했어요/)).toBeInTheDocument();
  });
});
