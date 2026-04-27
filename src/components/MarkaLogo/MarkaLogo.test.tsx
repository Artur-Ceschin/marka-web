import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LeafMark } from "./MarkaLogo";

describe("LeafMark", () => {
  it("renders an SVG", () => {
    const { container } = render(<LeafMark />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies the size prop to width and height", () => {
    const { container } = render(<LeafMark size={48} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
  });
});
