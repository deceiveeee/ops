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

  // Short all-capital words are usually initials a company keeps — CSX, NXP,
  // AMD, FTAI — so they stay as filed. The exceptions are the ordinary words
  // that happen to be short, which would otherwise come out shouting.
  const ordinary = new Set(["INC", "CORP", "CO", "LTD", "LLC", "LP", "PLC", "THE", "AND", "NEW", "OIL", "GAS", "AIR", "OF", "FOR"]);

  return trimmed
    .split(/(\s+)/)
    .map((token) => {
      const letters = token.replace(/[^A-Z]/g, "");
      if (letters.length >= 2 && letters.length <= 4 && !ordinary.has(letters)) return token;
      return token.toLowerCase().replace(/(^|[(.,&/-])([a-z])/g, (_, before, letter) => before + letter.toUpperCase());
    })
    .join("");
}

export default function IndustryView() {
  const [sic, setSic] = useState(industries.industries[0].sic);
  const [showMovement, setShowMovement] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const industry = useMemo(
    () => industries.industries.find((entry) => entry.sic === sic) ?? industries.industries[0],
    [sic],
  );

  const shown = industry.leaders.reduce((sum, leader) => sum + leader.share, 0);
  const widest = Math.max(...industry.leaders.map((leader) => leader.share), 0.01);
  const movers = industry.instability?.rows.filter((row) => row.name !== "Other") ?? [];
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
        <button
          type="button"
          onClick={() => setShowMovement(false)}
          aria-pressed={!showMovement}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-[13px]",
            !showMovement ? "border-white/25 bg-white/10 text-white" : "border-white/10 text-slate-400 hover:text-slate-200",
          )}
        >
          Who holds what
        </button>
        <button
          type="button"
          onClick={() => setShowMovement(true)}
          aria-pressed={showMovement}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-[13px]",
            showMovement ? "border-white/25 bg-white/10 text-white" : "border-white/10 text-slate-400 hover:text-slate-200",
          )}
        >
          What moved since {industries.years[0]}
        </button>
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-slate-400 hover:text-slate-200"
        >
          {showAll ? "Show fewer" : "Show all ten"}
        </button>
      </div>

      <Panel>
        {!showMovement ? (
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
