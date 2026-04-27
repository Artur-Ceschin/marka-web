import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ResultsList } from "./ResultsList";
import type { IdentifyResult } from "@/lib/api";

const mockResult: IdentifyResult = {
  name: "Silver Birch",
  latin: "Betula pendula",
  confidence: 0.92,
  family: "Betulaceae",
  tags: ["deciduous"],
};

describe("ResultsList", () => {
  it("renders result names", () => {
    render(<ResultsList results={[mockResult]} onSelect={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText("Silver Birch")).toBeInTheDocument();
    expect(screen.getByText("Betula pendula")).toBeInTheDocument();
  });

  it("calls onSelect with the result when a row is clicked", async () => {
    const onSelect = vi.fn();
    render(<ResultsList results={[mockResult]} onSelect={onSelect} onBack={vi.fn()} />);
    await userEvent.click(screen.getByText("Silver Birch"));
    expect(onSelect).toHaveBeenCalledWith(mockResult);
  });

  it("calls onBack when 'New scan' is clicked", async () => {
    const onBack = vi.fn();
    render(<ResultsList results={[mockResult]} onSelect={vi.fn()} onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: /new scan/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
