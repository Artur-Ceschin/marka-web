import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MobileNav } from "./MobileNav";

const items = [
  { id: "identify", label: "Identify", icon: <span>🌿</span> },
  { id: "notebook", label: "Notebook", icon: <span>📓</span> },
  { id: "profile",  label: "Profile",  icon: <span>👤</span> },
];

describe("MobileNav", () => {
  it("renders all nav items", () => {
    render(<MobileNav items={items} activeId="identify" onSelect={vi.fn()} />);
    expect(screen.getByText("Identify")).toBeInTheDocument();
    expect(screen.getByText("Notebook")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("marks the active item with aria-current", () => {
    render(<MobileNav items={items} activeId="notebook" onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: /notebook/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /identify/i })).not.toHaveAttribute("aria-current");
  });

  it("calls onSelect with the item id when clicked", async () => {
    const onSelect = vi.fn();
    render(<MobileNav items={items} activeId="identify" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /profile/i }));
    expect(onSelect).toHaveBeenCalledWith("profile");
  });
});
