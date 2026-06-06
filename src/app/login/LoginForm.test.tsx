import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

const signInWithPassword = vi.fn();
const signUp = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithPassword, signUp } }),
}));

beforeEach(() => {
  push.mockClear();
  refresh.mockClear();
  signInWithPassword.mockReset();
  signUp.mockReset();
});

describe("LoginForm", () => {
  it("signs in and navigates home on success", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("이메일"), "t@example.com");
    await userEvent.type(screen.getByLabelText("비밀번호"), "secret1");
    await userEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "t@example.com",
      password: "secret1",
    });
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows an error when sign in fails", async () => {
    signInWithPassword.mockResolvedValue({
      error: new Error("Invalid login credentials"),
    });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("이메일"), "t@example.com");
    await userEvent.type(screen.getByLabelText("비밀번호"), "wrongpw");
    await userEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid login credentials",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("toggles to sign up mode", async () => {
    render(<LoginForm />);
    await userEvent.click(
      screen.getByRole("button", { name: /가입하기/ }),
    );
    expect(
      screen.getByRole("button", { name: "가입하기" }),
    ).toBeInTheDocument();
  });
});
