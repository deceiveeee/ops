import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ShockLabScene } from "./DiversificationRiskJourney";

const HOLDINGS = ["Northstar Transit", "Harbor Grocery", "Orbit Software", "Clearwater Utility"];

/** "−9%", "+1%", "−4.3%" → -9, 1, -4.3. The lesson prints a true minus sign. */
function readMove(text: string | null | undefined): number {
  const cleaned = (text ?? "").replace("−", "-").replace("%", "").trim();
  const value = Number(cleaned);
  if (!Number.isFinite(value)) throw new Error(`Not a percentage: "${text}"`);
  return value;
}

function valueBelow(label: string): number {
  return readMove(screen.getByText(label).nextElementSibling?.textContent);
}

function shockResult(button: string) {
  fireEvent.click(screen.getByRole("button", { name: button }));
  return {
    holdings: HOLDINGS.map(valueBelow),
    northstar: valueBelow("Northstar move"),
    portfolio: valueBelow("Portfolio move"),
  };
}

const mean = (xs: number[]) => xs.reduce((sum, x) => sum + x, 0) / xs.length;

describe("Lesson 3.2 shock scene", () => {
  // The scene states the portfolio is equal-weight, so the portfolio move a
  // learner reads must be the plain average of the four holding moves they see.
  it.each(["Northstar-only disruption", "Economy-wide recession"])(
    "shows a portfolio move equal to the average of the holdings it shows (%s)",
    (button) => {
      render(<ShockLabScene onComplete={vi.fn()} />);
      const result = shockResult(button);
      expect(result.portfolio).toBeCloseTo(mean(result.holdings), 1);
      expect(result.northstar).toBe(result.holdings[0]);
    },
  );

  it("keeps the worked numbers: a company shock is diluted, a shared shock is not", () => {
    render(<ShockLabScene onComplete={vi.fn()} />);
    // (−20 + 1 + 1 + 1) / 4 = −4.25, printed to one decimal.
    expect(shockResult("Northstar-only disruption")).toEqual({
      holdings: [-20, 1, 1, 1],
      northstar: -20,
      portfolio: -4.3,
    });
    // Every holding falls 9%, so the equal-weight portfolio falls 9%.
    expect(shockResult("Economy-wide recession")).toEqual({
      holdings: [-9, -9, -9, -9],
      northstar: -9,
      portfolio: -9,
    });
  });

  it("completes once both shocks have been tried", () => {
    const onComplete = vi.fn();
    render(<ShockLabScene onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: "Northstar-only disruption" }));
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Economy-wide recession" }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
