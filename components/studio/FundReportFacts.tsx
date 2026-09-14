import { longDate } from "@/lib/studio-project/cost-of-capital";
import type { StudioInstrument } from "@/lib/studio-catalog";

/**
 * What a fund returned and cost, in its own annual report's figures.
 *
 * It sits after the fund's main risks, not above them, and carries the
 * report's own statement that past performance does not predict. The figures
 * are for the share class the learner would buy: a fund's other classes cost
 * more or less, and so return more or less, which is why the sentence about
 * share classes appears only where a fund has more than one.
 */
export default function FundReportFacts({ instrument }: { instrument: StudioInstrument }) {
  const report = instrument.report;
  if (!report) return null;

  const periodName = (years: number | null, start: string) =>
    years === null ? `Since ${longDate(start)}` : `${years} ${years === 1 ? "year" : "years"}`;
  // VXUS's report year charged 0.06%; its later prospectus gives 0.05%. Both are
  // true, so the card says where each comes from rather than picking one.
  const prospectusDiffers = instrument.expenseRatioPct !== null && instrument.expenseRatioPct !== report.costPct;

  return (
    <div>
      <div className="ops-caption text-[11px] text-slate-500">What it returned and cost, from its annual report</div>
      <div className="mt-2 overflow-x-auto">
        {/*
          At 390px the table has 324px. With 20px after every column VTI's needed
          334px and scrolled, so the padding is 12px and none after the last
          column. Only a "Since" heading may wrap: "Since 26 May 2020" is too wide
          for one line on a phone, and "5 years" over two lines reads as two labels.
        */}
        <table className="text-left text-[13px] tabular-nums">
          <thead>
            <tr>
              <td className="pr-3" />
              {report.returns.map((period) => (
                <th
                  key={period.start}
                  scope="col"
                  className={`pr-3 align-bottom font-normal text-slate-500 last:pr-0${period.years === null ? "" : " whitespace-nowrap"}`}
                >
                  {periodName(period.years, period.start)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="whitespace-nowrap pr-3 font-normal text-slate-500">
                Average a year
              </th>
              {report.returns.map((period) => (
                <td key={period.start} className="pr-3 text-[14px] font-semibold text-slate-200 last:pr-0">
                  {period.pct.toFixed(2)}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-slate-400">
        Periods ending {longDate(report.periodEnd)}
        {report.leavesOutTaxes ? ", before any tax you would pay" : ""}. Over that year it cost $
        {report.costPer10000Usd} for every $10,000 invested ({report.costPct.toFixed(2)}%).
        {prospectusDiffers
          ? ` The ${instrument.expenseRatioPct}% a year above is from its prospectus dated ${longDate(report.prospectusDated)}.`
          : ""}
        {report.classesInSeries > 1
          ? ` The fund has ${report.classesInSeries} kinds of shares, each with its own costs, so these are ${instrument.symbol}'s figures.`
          : ""}
      </p>
      <p className="mt-1 text-[13px] leading-5 text-slate-400">Its report says: “{report.pastPerformance}”</p>
    </div>
  );
}
