import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversationClient from "./ConversationClient";

vi.mock("@/lib/tts", () => ({ speak: vi.fn() }));

afterEach(() => vi.unstubAllGlobals());

describe("ConversationClient", () => {
  it("shows scenario picker then opens a chat", async () => {
    render(<ConversationClient />);
    expect(
      screen.getByRole("heading", { name: "대화 연습" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText("인사 나누기"));
    expect(
      screen.getByRole("heading", { name: "인사 나누기" }),
    ).toBeInTheDocument();
  });

  it("sends a message and renders the assistant reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ reply: "Hi teacher!", configured: false }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ConversationClient />);
    await userEvent.click(screen.getByText("자유 대화"));

    await userEvent.type(screen.getByLabelText("메시지"), "Hello!");
    await userEvent.click(screen.getByRole("button", { name: "전송" }));

    expect(await screen.findByText("Hello!")).toBeInTheDocument();
    expect(await screen.findByText("Hi teacher!")).toBeInTheDocument();

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.scenarioId).toBe("free");
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "Hello!" });
  });
});
