"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import industriesData from "@/lib/studio-project/data/industries.json";
import { checkEntries, FIGURES, read, type Entries, type FigureKey, type PeerContext } from "@/lib/studio-project/investigate";
import { COST_OF_CAPITAL_SOURCE, estimate, forSic, industryNames, forIndustry } from "@/lib/studio-project/cost-of-capital";
import type { RoicDecomposition, RoicSector } from "@/lib/studio-project/roic";
import { Panel, StageHeading } from "./shared";

/**
 * One company, seven figures the learner looked up, and what they mean.
 *
 * Studio does not hold every company's financials. The learner brings the
 * numbers for the business they care about; this surface says which ones matter
 * and where to find them, catches what is typed wrong, and interprets the
 * result against real peers and a real cost of capital.
 *
 * Three kinds of value appear here and are deliberately styled apart, because a
 * learner mistaking their own guess for a filed fact is the central danger:
 * what they looked up, what Studio calculated, and what is assumed.
 */

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

/** The industries Studio has already researched, with peers to compare against. */
const RESEARCHED = industriesData.industries.map((entry) => ({
  sic: entry.sic,
  label: entry.label,
  peers: (entry.roic ?? []).filter((row): row is typeof row & { roic: number; nopatMargin: number; capitalTurnover: number } =>
    typeof row.roic === "number" && typeof row.nopatMargin === "number" && typeof row.capitalTurnover === "number",
  ),
}));

const SECTOR_BY_SIC: Record<string, RoicSector> = {
  "3674": "general", "7372": "general", "5331": "general", "4011": "transport", "2834": "general",
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export default function InvestigateView() {
  const [company, setCompany] = useState("");
  const [sic, setSic] = useState(RESEARCHED[0].sic);
  const [entries, setEntries] = useState<Entries>({});
  const [riskFree, setRiskFree] = useState<string>("");
  const [openHint, setOpenHint] = useState<FigureKey | null>(null);

  const researched = RESEARCHED.find((entry) => entry.sic === sic)!;
  const sector = SECTOR_BY_SIC[sic] ?? "general";

  const peerContext: PeerContext | undefined = useMemo(() => {
    if (researched.peers.length < 5) return undefined;
    return {
      industry: researched.label.toLowerCase(),
      medianMargin: median(researched.peers.map((p) => p.nopatMargin)),
      medianTurnover: median(researched.peers.map((p) => p.capitalTurnover)),
      peers: researched.peers as unknown as RoicDecomposition[],
    };
  }, [researched]);

  const industryCost = forSic(sic) ?? forIndustry(industryNames()[0])!;
  const suppliedRate = riskFree.trim() === "" ? undefined : Number(riskFree) / 100;
  const cost = estimate(industryCost, Number.isFinite(suppliedRate) ? suppliedRate : undefined);

  const checks = checkEntries(entries, sector, peerContext);
  const stops = checks.filter((c) => c.severity === "stop");
  const questions = checks.filter((c) => c.severity === "question");
  const reading = stops.length ? { blocked: stops[0].message } : read(entries, sector, cost.costOfCapital, peerContext);

  const set = (key: FigureKey, raw: string) =>
    setEntries((current) => {
      const next = { ...current };
      if (raw.trim() === "") delete next[key];
      else if (Number.isFinite(Number(raw))) next[key] = Number(raw);
      return next;
    });

  const flagged = new Set(checks.flatMap((c) => c.figures));

  return (
    <div className="space-y-4">
      <Link href="/studio" className="inline-block text-[13px] text-slate-500 hover:text-slate-300">
        ← Back to your plan
      </Link>

      <StageHeading eyebrow="Investigate" title="Is this business creating value?">
        Look up seven figures for a company you care about. Studio says which ones matter, checks
        what you typed, and tells you what the answer means against real competitors.
      </StageHeading>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---------------------------------------------------------- entry */}
        <Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="ops-caption text-[11px] text-slate-500">Company</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="The one you want to understand"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[14px] text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="ops-caption text-[11px] text-slate-500">Industry</span>
              <select
                value={sic}
                onChange={(event) => setSic(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[14px] text-white focus:border-accent-cyan/50 focus:outline-none"
              >
                {RESEARCHED.map((entry) => (
                  <option key={entry.sic} value={entry.sic} className="bg-slate-900">
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="mt-4 text-[13px] leading-6 text-slate-400">
            All seven come from one annual report. Click a name to see where it sits and what other
            sites call it.
          </p>

          <div className="mt-3 space-y-2">
            {FIGURES.map((figure) => {
              const open = openHint === figure.key;
              const marked = flagged.has(figure.key);
              return (
                <div key={figure.key}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenHint(open ? null : figure.key)}
                      aria-expanded={open}
                      className="min-w-[150px] shrink-0 text-left text-[13px] text-slate-300 hover:text-white"
                    >
                      {figure.label}
                      <span className="ml-1 text-slate-600">?</span>
                    </button>
                    <input
                      inputMode="decimal"
                      value={entries[figure.key] ?? ""}
                      onChange={(event) => set(figure.key, event.target.value)}
                      placeholder="0"
                      aria-label={figure.label}
                      className={cn(
                        "w-full rounded-lg border bg-white/[0.03] px-3 py-1.5 text-right text-[14px] tabular-nums text-white placeholder:text-slate-700 focus:outline-none",
                        marked ? "border-accent-amber/50" : "border-white/10 focus:border-accent-cyan/50",
                      )}
                    />
                  </div>
                  {open ? (
                    <p className="mt-1 pl-[158px] text-[12px] leading-5 text-slate-500">
                      {figure.whatItIs} On the {figure.statement}. Also called{" "}
                      {figure.alsoCalled.join(", ")}.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-[12px] leading-5 text-slate-600">
            Use the same units throughout — all millions, or all billions. Studio only compares them
            with each other.
          </p>

          {checks.length ? (
            <div className="mt-4 space-y-2">
              {[...stops, ...questions].map((check, index) => (
                <p
                  key={index}
                  className={cn(
                    "rounded-lg border p-3 text-[13px] leading-6",
                    check.severity === "stop"
                      ? "border-accent-red/30 bg-accent-red/[0.06] text-slate-200"
                      : "border-accent-amber/30 bg-accent-amber/[0.05] text-slate-300",
                  )}
                >
                  {check.message}
                </p>
              ))}
            </div>
          ) : null}
        </Panel>

        {/* -------------------------------------------------------- reading */}
        <div className="space-y-4">
          <Panel>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-white">What the money costs</h3>
              <span className="text-[20px] font-semibold tabular-nums text-white">{pct(cost.costOfCapital, 2)}</span>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-slate-400">
              No company reports this — it has to be estimated. A return above it means the business
              creates value; below it, the money would do better elsewhere.
            </p>

            <label className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-slate-400">
              <span>Government borrowing rate</span>
              <input
                inputMode="decimal"
                value={riskFree}
                onChange={(event) => setRiskFree(event.target.value)}
                placeholder={(COST_OF_CAPITAL_SOURCE.impliedRiskFreeRate * 100).toFixed(2)}
                className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-right text-[13px] tabular-nums text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none"
              />
              <span>%</span>
            </label>

            <details className="mt-3">
              <summary className="cursor-pointer text-[12px] text-slate-500">Where this number comes from</summary>
              <ul className="mt-2 space-y-1 text-[12px] leading-5 text-slate-500">
                {cost.provenance.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </details>
          </Panel>

          {"blocked" in reading ? (
            <Panel>
              <p className="text-[13px] leading-6 text-slate-500">{reading.blocked}</p>
            </Panel>
          ) : (
            <>
              <Panel>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-white">
                    {company.trim() || "This business"} earns
                  </h3>
                  <span
                    className={cn(
                      "text-[24px] font-semibold tabular-nums",
                      reading.createsValue ? "text-accent-green" : "text-accent-red",
                    )}
                  >
                    {pct(reading.decomposition.roic)}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {reading.says.map((line, index) => (
                    <p key={index} className="text-[13px] leading-6 text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="mt-3 text-[12px] leading-5 text-slate-600">
                  Calculated from what you entered — not a figure any company reports.
                </p>
              </Panel>

              <Panel>
                <h3 className="text-[14px] font-semibold text-white">What this cannot tell you</h3>
                <ul className="mt-2 space-y-2">
                  {reading.cannotTell.map((line, index) => (
                    <li key={index} className="text-[12px] leading-5 text-slate-500">
                      {line}
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          )}
        </div>
      </div>

      <p className="text-[12px] leading-5 text-slate-600">
        Nothing here is saved yet — that arrives with the workspace. Peer figures come from company
        filings; the cost of capital from Aswath Damodaran, NYU Stern.
      </p>
    </div>
  );
}
