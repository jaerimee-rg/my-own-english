import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhraseForm from "./PhraseForm";

describe("PhraseForm", () => {
  it("shows validation errors when required fields are empty", async () => {
    const onSubmit = vi.fn();
    render(<PhraseForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
  });

  it("submits normalized input when valid", async () => {
    const onSubmit = vi.fn();
    render(<PhraseForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("영어 문장"), "Point your toes");
    await userEvent.type(screen.getByLabelText("한국어 뜻"), "발끝을 펴세요");
    await userEvent.selectOptions(screen.getByLabelText("소도구"), "ribbon");

    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      english: "Point your toes",
      korean: "발끝을 펴세요",
      apparatus: "ribbon",
    });
  });

  it("prefills from initial values", () => {
    render(
      <PhraseForm
        initial={{ english: "Hello", korean: "안녕" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("영어 문장")).toHaveValue("Hello");
    expect(screen.getByLabelText("한국어 뜻")).toHaveValue("안녕");
  });
});
