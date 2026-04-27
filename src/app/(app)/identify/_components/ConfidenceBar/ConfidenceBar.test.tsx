import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ConfidenceBar } from "./ConfidenceBar";

describe("ConfidenceBar", () => {
  it("renders a progressbar", () => {
    render(<ConfidenceBar pct={75} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows High Confidence for pct >= 80", () => {
    render(<ConfidenceBar pct={85} />);
    expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
  });

  it("shows Medium Confidence for pct 50–79", () => {
    render(<ConfidenceBar pct={60} />);
    expect(screen.getByText(/medium confidence/i)).toBeInTheDocument();
  });

  it("shows Low Confidence for pct < 50", () => {
    render(<ConfidenceBar pct={30} />);
    expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
  });

  it("clamps values above 100", () => {
    render(<ConfidenceBar pct={120} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
