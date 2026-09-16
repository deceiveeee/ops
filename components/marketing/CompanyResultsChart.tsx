import { atkoreResults, percentageChange } from "@/data/marketing/teachingVisuals";

const dollars = (thousands: number) => (thousands / 1000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function CompanyResultsChart({ selected }: { selected: number }) {
  const result = atkoreResults[selected];
  const decline = Math.abs(percentageChange(result.previous, result.latest)).toFixed(1);
  return (
    <figure className="company-results-chart">
      <figcaption><strong>{result.label}</strong><span>Fiscal years ending September 30 · USD millions</span></figcaption>
      {[{ year: 2024, value: result.previous }, { year: 2025, value: result.latest }].map(row => <div className="company-results-row" key={row.year}>
        <div><span>{row.year}</span><strong>{dollars(row.value)}</strong></div>
        <div className="company-results-track"><div data-year={row.year} style={{ transform: `scaleX(${row.value / 3500000})` }} /></div>
      </div>)}
      <div className="company-results-axis" aria-hidden="true"><span>0</span><span>1,750</span><span>3,500</span></div>
      <p className="company-results-takeaway">{decline}% lower in 2025.</p>
      <p className="company-results-definition">{result.definition}</p>
    </figure>
  );
}
