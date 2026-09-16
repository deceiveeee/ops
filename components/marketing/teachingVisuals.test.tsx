import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { atkoreResults, federalFundsHistory, percentageChange, recoveryAfterLoss } from "@/data/marketing/teachingVisuals";
import { readFileSync } from "node:fs";
import FedRateChart from "./FedRateChart";
import CompanyResultsChart from "./CompanyResultsChart";

describe("source-backed teaching visuals", () => {
  it("preserves every dated observation in the original Board download", () => {
    const csv = readFileSync("docs/source-audits/data/h15-effective-federal-funds-2022-2024.csv", "utf8");
    const observations = csv.split(/\r?\n/).filter(line => /^\d{4}-\d{2},/.test(line)).map(line => {
      const [month, rate] = line.split(",");
      return [month, Number(rate)];
    });
    expect(observations).toHaveLength(36);
    expect(federalFundsHistory).toEqual(observations);
  });

  it("updates the selected historical observation accessibly", () => {
    render(<FedRateChart />);
    expect(screen.getByRole("status")).toHaveTextContent("5.33%");
    fireEvent.click(screen.getByRole("button", { name: "Jan 2022" }));
    expect(screen.getByRole("status")).toHaveTextContent("0.08%");
    expect(screen.getByRole("button", { name: "Jan 2022" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Dec 2024" }));
    expect(screen.getByRole("status")).toHaveTextContent("4.48%");
  });

  it("adds no nested links or buttons to linked course previews", () => {
    const { container } = render(<FedRateChart compact embeddedInLink />);
    expect(container.querySelectorAll("a, button, summary")).toHaveLength(0);
  });

  it("keeps the homepage overview static with three dated values and one interpretation", () => {
    const { container } = render(<FedRateChart overview />);
    expect(screen.getByRole("figure", { name: "Banks’ overnight borrowing rate" })).toBeInTheDocument();
    expect([...container.querySelectorAll("dt")].map(item => item.textContent)).toEqual(["Jan 2022", "Aug 2023", "Dec 2024"]);
    expect([...container.querySelectorAll("dd")].map(item => item.textContent)).toEqual(["0.08%", "5.33%", "4.48%"]);
    expect(container.querySelectorAll("button, table, details")).toHaveLength(0);
    expect(screen.getByText("Higher interest rates generally make borrowing more expensive, which can slow spending and investment.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore why" })).toHaveAttribute("href", expect.stringContaining("federalreserve.gov/monetarypolicy/"));
  });

  it("matches the filing's 11.0% sales and 96.3% operating-income declines", () => {
    expect(atkoreResults.map(row => percentageChange(row.previous, row.latest).toFixed(1))).toEqual(["-11.0", "-96.3"]);
    const { rerender } = render(<CompanyResultsChart selected={0} />);
    expect(screen.getByText("3,202.1")).toBeInTheDocument();
    rerender(<CompanyResultsChart selected={1} />);
    expect(screen.getByText("23.2")).toBeInTheDocument();
    expect(screen.getByText("96.3% lower in 2025.")).toBeInTheDocument();
  });

  it("recovers the starting value after losses of different sizes", () => {
    for (const loss of [0, 10, 20, 50, 90]) {
      const result = recoveryAfterLoss(loss);
      expect(result.remaining * (1 + result.gainPercent / 100)).toBeCloseTo(100);
    }
    expect(recoveryAfterLoss(20).gainPercent).toBe(25);
    expect(() => recoveryAfterLoss(100)).toThrow(RangeError);
  });
});
