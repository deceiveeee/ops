import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import DurationShockSimulator from "./DurationShockSimulator";

/**
 * The simulator explains which way the duration-only estimate misses. For an
 * ordinary fixed-payment bond, price is a convex function of yield, so the real
 * price sits above the duration tangent line on both sides: the estimate
 * understates the gain when yields fall and overstates the loss when they rise.
 * The bond below is computed here directly, not with the lesson's helpers.
 */
function exactAndDurationEstimate(dy: number) {
  // Ten annual $4 payments plus $100 at year 10, priced at 4%.
  const cfs = Array.from({ length: 10 }, (_, i) => [i + 1, 4 + (i === 9 ? 100 : 0)] as const);
  const price = (y: number) => cfs.reduce((s, [t, c]) => s + c / (1 + y) ** t, 0);
  const y = 0.04;
  const p0 = price(y);
  const macaulay = cfs.reduce((s, [t, c]) => s + (t * c) / (1 + y) ** t, 0) / p0;
  const modified = macaulay / (1 + y);
  return { p0, exact: price(y + dy), estimate: p0 * (1 - modified * dy) };
}

describe("Lesson 3.3 duration shock simulator", () => {
  it("rests on the fact that the real price stays above the duration estimate", () => {
    for (const dy of [-0.02, -0.01, 0.01, 0.02]) {
      const { p0, exact, estimate } = exactAndDurationEstimate(dy);
      expect(exact).toBeGreaterThan(estimate);
      if (dy < 0) expect(exact - p0).toBeGreaterThan(estimate - p0); // gain understated
      else expect(p0 - exact).toBeLessThan(p0 - estimate); // loss overstated
    }
  });

  it("states the direction of the miss correctly", () => {
    const { container } = render(<DurationShockSimulator />);
    const text = (container.textContent ?? "").replace(/\s+/g, " ");
    expect(text).toContain("underestimates gains when yields fall and overestimates losses when yields rise");
    expect(text).toContain("the real price ends up higher than this estimate");
    expect(text).not.toMatch(/overestimates gains|underestimates losses|especially the downside/);
  });

  it("writes the worked result in words with one sign", () => {
    const { container } = render(<DurationShockSimulator />);
    // Default +10 bps on modified duration 6.86 and price $103.50:
    // 103.50 × (1 − 0.00686) = 102.78999, shown as $102.79.
    expect(container.textContent).toContain("New price ≈ $103.50 × (1 − 0.686%) = $102.79");
    expect(container.textContent).not.toMatch(/\+ -|P_?new/);
  });
});
