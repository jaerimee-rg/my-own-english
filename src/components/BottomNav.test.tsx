import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BottomNav from "./BottomNav";

const pathname = vi.hoisted(() => ({ value: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
}));

describe("BottomNav", () => {
  beforeEach(() => {
    pathname.value = "/";
  });

  it("renders all five navigation links", () => {
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: /홈/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /문장집/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /학습/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /대화/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /설정/ })).toBeInTheDocument();
  });

  it("marks the active route with aria-current", () => {
    pathname.value = "/study";
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: /학습/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /홈/ })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
