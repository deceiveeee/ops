import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import CompoundingTable from "./CompoundingTable";

/*
 * Expected values worked out separately from the component, by hand:
 *   100 × 1.02^10 = 121.899…  → $121.90
 *   100 × 1.05^10 = 162.889…  → $162.89
 *   100 × 1.08^10 = 215.892…  → $215.89
 *   growth in year 10 at 5% = 100 × 1.05^9 × 0.05 = 7.7566… → $7.76
 */
describe("the $100 compounding table", () => {
  const rows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);

  it("opens at 5% with ten years, growth rising every year", () => {
    render(<CompoundingTable />);
    expect(screen.getByRole("button", { name: "5%" })).toHaveAttribute("aria-pressed", "true");
    expect(rows()).toHaveLength(10);
    expect(rows()[0]).toHaveTextContent("$5.00");
    expect(rows()[0]).toHaveTextContent("$105.00");
    expect(rows()[9]).toHaveTextContent("$7.76");
    expect(rows()[9]).toHaveTextContent("$162.89");
    const growth = rows().map((row) => Number(within(row).getAllByRole("cell")[0].textContent!.replace(/[^0-9.]/g, "")));
    growth.slice(1).forEach((value, index) => expect(value).toBeGreaterThan(growth[index]));
    expect(screen.getByRole("status")).toHaveTextContent("After 10 years at 5%: $162.89");
  });

  it("recomputes every row for another rate", () => {
    render(<CompoundingTable />);
    fireEvent.click(screen.getByRole("button", { name: "2%" }));
    expect(screen.getByRole("status")).toHaveTextContent("$121.90");
    fireEvent.click(screen.getByRole("button", { name: "8%" }));
    expect(screen.getByRole("status")).toHaveTextContent("$215.89");
    expect(rows()[9]).toHaveTextContent("$215.89");
  });

  it("says it is an example and that real returns vary", () => {
    render(<CompoundingTable />);
    expect(screen.getByText(/OPS example/)).toBeInTheDocument();
    expect(screen.getByText(/Real investment returns vary and can be negative/)).toBeInTheDocument();
  });
});
