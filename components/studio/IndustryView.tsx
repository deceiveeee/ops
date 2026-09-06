"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import industries from "@/lib/studio-project/data/industries.json";
import { Panel, Stat, StageHeading, TableScroll } from "./shared";

/**
 * The outside-in view of an industry, before any single company.
 *
 * Ordered the way *Measuring the Moat* orders it: who is in the industry, how
 * the revenue is split, and how much of it has moved. The paper's two cautions
 * are on the page rather than in a footnote, because both of them change what a
 * reader should conclude:
 *
 * - Variance within an industry exceeds variance across industries, so this
 *   narrows a search and never settles it.
 * - Concentration is not reliably linked to value creation. Share is the better
 *   link, so share leads and concentration is offered as description.
 */

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const money = (value: number) =>
  Math.abs(value) >= 1e12
    ? `$${(value / 1e12).toFixed(2)}T`
    : Math.abs(value) >= 1e9
      ? `$${(value / 1e9).toFixed(1)}B`
      : `$${(value / 1e6).toFixed(0)}M`;

/**
 * SEC registrant names as a person would write them.
 *
 * They arrive shouting and with a state of incorporation stapled on — "APPLIED
 * MATERIALS INC /DE", "PFIZER INC". Names that already carry mixed case are
 * left exactly as filed, since the company chose them.
 */
function readableName(raw: string): string {
  const trimmed = raw.replace(/\s*\/[A-Z]{2}[A-Z/]*\s*$/, "").trim();
  if (trimmed !== trimmed.toUpperCase()) return trimmed;

  // Two- and three-letter capitals are usually initials a company keeps — CSX,
  // NXP, AMD — so they stay as filed. Four letters and up get title case,
  // because ordinary words live there: BJ'S Wholesale CLUB and Dollar TREE both
  // came out shouting when the rule ran to four. The cost is that a genuine
  // four-letter acronym like FTAI reads as Ftai, which is the cheaper mistake.
  const ordinary = new Set(["INC", "CO", "LTD", "LLC", "LP", "THE", "AND", "NEW", "OIL", "GAS", "AIR", "OF", "FOR"]);

  return trimmed
    .split(/(\s+)/)
    .map((token) => {
      const letters = token.replace(/[^A-Z]/g, "");
      if (letters.length >= 2 && letters.length <= 3 && !ordinary.has(letters)) return token;
      return token.toLowerCase().replace(/(^|[(.,&/-])([a-z])/g, (_, before, letter) => before + letter.toUpperCase());
    })
    .join("");
}

type Earner = {
  name: string;
  cik: number;
  roic?: number;
  nopatMargin?: number;
  capitalTurnover?: number;
  advantage?: string;
  reason?: string;
  advantageWithheld?: string;
};

/**
 * The plane the paper reads a company's advantage off.
 *
 * NOPAT margin runs left to right, invested capital turnover bottom to top, and
 * the two multiply to the return on capital. The bottom right is where a
 * company that charges more sits; the top left is where one that turns its
 * capital hard sits. Median lines rather than fixed thresholds, because high
 * and low only mean anything against the other companies here.
 */
function AdvantagePlane({ earners }: { earners: Earner[] }) {
  // Only companies actually earning a return are plotted. A loss-making one
  // stretches both axes and squashes everyone else into a corner — JinkoSolar
  // at minus 65% did exactly that — and the advantage this plane reads is not
  // defined for it anyway. The paper truncates its own axes for the same
  // reason. The ones left off are named underneath rather than dropped.
  const points = earners.filter(
    (e): e is Earner & { nopatMargin: number; capitalTurnover: number; roic: number } =>
      e.nopatMargin !== undefined && e.capitalTurnover !== undefined && e.roic !== undefined && e.roic > 0,
  );
  const offChart = earners.filter((e) => e.roic !== undefined && e.roic <= 0);
  if (points.length < 3) return null;

  const width = 640;
  const height = 240;
  const pad = { left: 46, right: 16, top: 18, bottom: 34 };
  const marginMax = Math.max(...points.map((p) => p.nopatMargin), 0.05) * 1.15;
  const marginMin = Math.min(...points.map((p) => p.nopatMargin), 0) * 1.15;
  const turnoverMax = Math.max(...points.map((p) => p.capitalTurnover)) * 1.15;

  const x = (v: number) => pad.left + ((v - marginMin) / (marginMax - marginMin)) * (width - pad.left - pad.right);
  const y = (v: number) => height - pad.bottom - (v / turnoverMax) * (height - pad.top - pad.bottom);

  const sorted = (values: number[]) => [...values].sort((a, b) => a - b);
  const mid = (values: number[]) => {
    const s = sorted(values);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const medianMargin = mid(points.map((p) => p.nopatMargin));
  const medianTurnover = mid(points.map((p) => p.capitalTurnover));

  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[520px]" role="img" aria-label="Profit margin against capital turnover for this industry's leaders">
        <line x1={x(medianMargin)} y1={pad.top} x2={x(medianMargin)} y2={height - pad.bottom} stroke="currentColor" className="text-white/15" strokeDasharray="3 4" />
        <line x1={pad.left} y1={y(medianTurnover)} x2={width - pad.right} y2={y(medianTurnover)} stroke="currentColor" className="text-white/15" strokeDasharray="3 4" />
        <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} stroke="currentColor" className="text-white/25" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="currentColor" className="text-white/25" />

        <text x={width - pad.right} y={height - pad.bottom - 8} textAnchor="end" className="fill-slate-600 text-[10px]">
          charges more →
        </text>
        <text x={pad.left + 8} y={pad.top + 12} className="fill-slate-600 text-[10px]">
          ↑ turns capital faster
        </text>

        {points.map((point) => (
          <g key={point.cik}>
            <circle cx={x(point.nopatMargin)} cy={y(point.capitalTurnover)} r={5} className="fill-accent-amber/70" />
            <text
              x={x(point.nopatMargin)}
              y={y(point.capitalTurnover) - 9}
              textAnchor="middle"
              className="fill-slate-400 text-[9px]"
            >
              {readableName(point.name).split(/[\s,]/)[0].slice(0, 12)}
            </text>
          </g>
        ))}

        <text x={pad.left} y={height - 10} className="fill-slate-500 text-[10px]">
          {pct(marginMin, 0)}
        </text>
        <text x={width - pad.right} y={height - 10} textAnchor="end" className="fill-slate-500 text-[10px]">
          profit margin {pct(marginMax, 0)}
        </text>
        <text x={8} y={pad.top + 4} className="fill-slate-500 text-[10px]">
          {turnoverMax.toFixed(1)}x
        </text>
        <text x={8} y={height - pad.bottom} className="fill-slate-500 text-[10px]">
          0x
        </text>
      </svg>
      {offChart.length ? (
        <p className="mt-2 text-[12px] leading-5 text-slate-500">
          Not on the chart: {offChart.map((e) => readableName(e.name)).join(", ")} — {offChart.length === 1 ? "it is" : "they are"} losing money, so
          there is no return to explain. {offChart.length === 1 ? "It is" : "They are"} in the table below.
        </p>
      ) : null}
    </div>
  );
}

export default function IndustryView() {
  const [sic, setSic] = useState(industries.industries[0].sic);
  const [view, setView] = useState<"shares" | "movement" | "returns">("shares");
  const [showAll, setShowAll] = useState(false);

  const industry = useMemo(
    () => industries.industries.find((entry) => entry.sic === sic) ?? industries.industries[0],
    [sic],
  );

  const shown = industry.leaders.reduce((sum, leader) => sum + leader.share, 0);
  const widest = Math.max(...industry.leaders.map((leader) => leader.share), 0.01);
  const movers = industry.instability?.rows.filter((row) => row.name !== "Other") ?? [];
  const earners: Earner[] = industry.roic ?? [];
  const earning = earners.filter((e) => e.roic !== undefined);
  const widestMove = Math.max(...movers.map((row) => row.absoluteChange), 0.01);

  return (
    <div className="space-y-4">
      <StageHeading eyebrow="Industry" title="Who is in this industry, and what has moved">
        Look at who competes and how much of the split has changed, before deciding whether any
        one of them is worth your time.
      </StageHeading>

      <div className="flex flex-wrap gap-2">
        {industries.industries.map((entry) => (
          <button
            key={entry.sic}
            type="button"
            onClick={() => setSic(entry.sic)}
            aria-pressed={entry.sic === sic}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] transition-colors",
              entry.sic === sic
                ? "border-accent-amber/60 bg-accent-amber/10 text-white"
                : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-slate-200",
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            label="Companies filing"
            value={String(industry.filersWithRevenue)}
            detail={`of ${industry.registrants.toLocaleString()} registered here`}
          />
          <Stat label="Combined revenue" value={money(industry.totalRevenue)} detail={`for ${industries.years[1]}`} />
          <Stat
            label="Largest four hold"
            value={pct(industry.c4)}
            detail={`concentration index ${Math.round(industry.hhi).toLocaleString()}`}
          />
          <Stat
            label="Share that moved"
            value={industry.instability ? pct(industry.instability.average) : "—"}
            detail={
              industry.instability?.stableByRuleOfThumb === null
                ? "average change per company"
                : industry.instability?.stableByRuleOfThumb
                  ? "steady, on the usual test"
                  : "unsettled, on the usual test"
            }
          />
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["shares", "Who holds what"],
            ["movement", `What moved since ${industries.years[0]}`],
            ["returns", "How they earn it"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            aria-pressed={view === key}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[13px]",
              view === key ? "border-white/25 bg-white/10 text-white" : "border-white/10 text-slate-400 hover:text-slate-200",
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-slate-400 hover:text-slate-200"
        >
          {showAll ? "Show fewer" : "Show all"}
        </button>
      </div>

      <Panel>
        {view === "returns" ? (
          <>
            <p className="text-[13px] leading-6 text-slate-400">
              Return on the money each company has put into its business, split into the two things
              that produce it: the profit it keeps on each pound of sales, and how many pounds of
              sales it gets from each pound of capital. Multiply the two and you have the return.
            </p>
            <AdvantagePlane earners={earners} />
            <TableScroll>
              <table className="mt-4 w-full min-w-[520px] text-left text-[13px]">
                <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 text-right font-medium">Return</th>
                    <th className="pb-2 text-right font-medium">Margin</th>
                    <th className="pb-2 text-right font-medium">Turnover</th>
                    <th className="pb-2 pl-4 font-medium">How</th>
                  </tr>
                </thead>
                <tbody>
                  {earning
                    .slice()
                    .sort((a, b) => (b.roic ?? 0) - (a.roic ?? 0))
                    .slice(0, showAll ? undefined : 6)
                    .map((earner) => (
                      <tr key={earner.cik} className="border-t border-white/5">
                        <td className="py-2 pr-3 text-slate-200">{readableName(earner.name)}</td>
                        <td className="py-2 text-right tabular-nums text-slate-300">{pct(earner.roic!)}</td>
                        <td className="py-2 text-right tabular-nums text-slate-400">{pct(earner.nopatMargin!)}</td>
                        <td className="py-2 text-right tabular-nums text-slate-400">{earner.capitalTurnover!.toFixed(2)}x</td>
                        <td className="py-2 pl-4 text-slate-400">
                          {earner.advantage === "differentiation"
                            ? "charges more"
                            : earner.advantage === "cost leadership"
                              ? "turns capital faster"
                              : earner.advantage === "both"
                                ? "both"
                                : earner.advantage === "neither"
                                  ? "neither stands out"
                                  : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </TableScroll>
            {earners.length > earning.length ? (
              <p className="mt-3 text-[12px] leading-5 text-slate-500">
                Not shown: {earners.filter((e) => e.roic === undefined).map((e) => readableName(e.name)).join(", ")}.
                Their filings do not carry what this needs — {earners.find((e) => e.reason)?.reason}.
              </p>
            ) : null}
          </>
        ) : view === "shares" ? (
          <>
            <p className="text-[13px] leading-6 text-slate-400">
              The largest by revenue. All ten together are {pct(shown)} of everything filed here.
            </p>
            <TableScroll>
              <table className="mt-4 w-full min-w-[520px] text-left text-[13px]">
                <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 text-right font-medium">Revenue</th>
                    <th className="pb-2 pl-4 font-medium">Share of the industry</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAll ? industry.leaders : industry.leaders.slice(0, 6)).map((leader) => (
                    <tr key={leader.cik} className="border-t border-white/5">
                      <td className="py-2 pr-3 text-slate-200">
                        {readableName(leader.name)}
                        {leader.basisUncertain ? (
                          <span className="ml-2 text-[11px] text-accent-amber" title="This company files more than one revenue figure. Check it before relying on it.">
                            check revenue
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 text-right tabular-nums text-slate-300">{money(leader.revenue)}</td>
                      <td className="py-2 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-accent-amber/70"
                              style={{ width: `${(leader.share / widest) * 100}%` }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right tabular-nums text-slate-300">{pct(leader.share)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          </>
        ) : (
          <>
            <p className="text-[13px] leading-6 text-slate-400">
              How each company&rsquo;s share changed between {industries.years[0]} and {industries.years[1]}. Averaging
              those changes gives {industry.instability ? pct(industry.instability.average) : "—"}. A five-year average
              of two points or less is usually called steady.
            </p>
            <TableScroll>
              <table className="mt-4 w-full min-w-[520px] text-left text-[13px]">
                <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 text-right font-medium">{industries.years[0]}</th>
                    <th className="pb-2 text-right font-medium">{industries.years[1]}</th>
                    <th className="pb-2 pl-4 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAll ? movers : movers.slice(0, 6)).map((row) => (
                    <tr key={row.name} className="border-t border-white/5">
                      <td className="py-2 pr-3 text-slate-200">{readableName(row.name)}</td>
                      <td className="py-2 text-right tabular-nums text-slate-400">
                        {row.earlierShare === null ? "not yet filing" : pct(row.earlierShare)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-slate-300">
                        {row.laterShare === null ? "no longer filing" : pct(row.laterShare)}
                      </td>
                      <td className="py-2 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full max-w-[140px] overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-sky-400/70"
                              style={{ width: `${(row.absoluteChange / widestMove) * 100}%` }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right tabular-nums text-slate-300">
                            {pct(row.absoluteChange)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          </>
        )}
      </Panel>

      <Panel>
        <h3 className="text-[15px] font-semibold text-white">Two things this cannot tell you</h3>
        <p className="mt-2 text-[13px] leading-6 text-slate-400">
          Companies in one industry differ from each other more than industries differ from one
          another. This narrows your search; it does not make the choice for you.
        </p>
        <p className="mt-2 text-[13px] leading-6 text-slate-400">
          A concentrated industry is not automatically a profitable one. A company&rsquo;s own share
          tracks its profits better than its industry&rsquo;s concentration does.
        </p>
      </Panel>

      <details className="group rounded-xl border border-white/12 bg-white/[0.03] p-4">
        <summary className="cursor-pointer text-[13px] text-slate-300">Where these numbers come from</summary>
        <div className="mt-2 text-[13px] leading-6 text-slate-400">
        <p>
          Shares are each company&rsquo;s revenue as a fraction of what every company filing under
          this industry code reported. Revenue is a stand-in for the market: it moves with prices,
          and a company that owns more of its own supply chain books more of it.
          {industry.unresolvable.length > 0 ? (
            <>
              {" "}
              {industry.unresolvable.map((entry) => readableName(entry.name)).join(", ")}{" "}
              {industry.unresolvable.length === 1 ? "is" : "are"} left out: {industry.unresolvable.length === 1 ? "it files" : "they file"} two
              revenue figures too far apart to choose between.
            </>
          ) : null}
        </p>
        <p className="mt-2">
          Built from public SEC filings for {industries.years[0]} and {industries.years[1]}, on{" "}
          {industries.builtOn}. The way share movement is measured follows Morgan Stanley&rsquo;s
          Counterpoint Global.
        </p>
        </div>
      </details>
    </div>
  );
}
