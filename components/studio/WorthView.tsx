"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { estimate, forIndustry, forSic, industryNames } from "@/lib/studio-project/cost-of-capital";
import { FIGURES, type Entries, type FigureKey } from "@/lib/studio-project/investigate";
import { decomposeRoic, isComputed, type RoicSector } from "@/lib/studio-project/roic";
import {
  equityFromFirm,
  firmValue,
  firmValueAtPrice,
  impliedGrowth,
  isValued,
  sensitivity,
} from "@/lib/studio-project/valuation";
import type { FilingRef } from "./FilingPassages";
import { Choice, Field, Panel, Stat } from "./shared";
import StudioAside from "./workspace/StudioAside";

/**
 * What a price assumes, rather than what a company is worth.
 *
 * The handoff asks for valuation with sensitivities and "a reverse question
 * about what assumptions the observed price requires", and warns that
 * uncertainty must not disappear into a single confident price target. Both
 * point the same way, so the reverse question is the headline here: the learner
 * types what someone is asking for a share, and the page says what growth that
 * price is buying. The value at their own assumptions sits beside it, and a
 * grid shows how little it takes to move it.
 *
 * **The model is the one Studio teaches**, from the audited Damodaran session:
 * a business growing steadily for ever, with growth bought at a stated return
 * on new money. `lib/studio-project/valuation.ts` carries the arithmetic and
 * the refusals, and `studio-quantitative-methods.md` §3 carries the conventions.
 *
 * Every figure it starts from is the company's own: operating profit, tax,
 * borrowings, cash and shares from the filing, and a cost of capital from
 * Studio's sourced industry table. Each one is editable, because each one is an
 * assumption the moment it is used for the future.
 */

const LOOK_FOR =
  "What the price is asking the business to do. A price is not a fact about a company, it is a bet about its future, and the growth it needs is something you can judge against what the business has actually done.";

const button =
  "inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-4 text-[14px] font-semibold text-white transition-colors hover:border-accent-cyan/70 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40";

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const money = (value: number) =>
  Math.abs(value) >= 1e9 ? `$${(value / 1e9).toFixed(1)}bn` : Math.abs(value) >= 1e6 ? `$${(value / 1e6).toFixed(0)}m` : `$${value.toFixed(0)}`;
const perShare = (value: number) => `$${value.toFixed(2)}`;
/** A figure's name as Investigate asks for it, so a gap reads as English rather than a field name. */
const figureLabel = (key: FigureKey) => FIGURES.find((figure) => figure.key === key)?.label.toLowerCase() ?? key;
const num = (text: string) => {
  // An empty box is not a zero: it means "use what was sourced", and reading it
  // as zero is what left this whole page blank the first time it was driven.
  const cleaned = text.replace(/[^0-9.-]/g, "").trim();
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
};

interface CompanyFigures {
  cik: string;
  name?: string;
  sector?: RoicSector;
  periodEnd?: string;
  figures?: { key: FigureKey; value: number; concepts: string[] }[];
  missing?: { key: FigureKey; reason: string }[];
  shares?: { value?: number; concept?: string; reason?: string };
  unavailable?: string;
}

/** Growth rates the grid walks, and how far either side of the cost of capital it looks. */
const GROWTHS = [0, 0.02, 0.04, 0.06];
const COST_STEPS = [-0.01, 0, 0.01];

export default function WorthView({
  filing,
  tabs,
}: {
  filing: Omit<FilingRef, "sectionId">;
  tabs: React.ReactNode;
}) {
  const [reading, setReading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyFigures | null>(null);
  const [price, setPrice] = useState("");
  const [growth, setGrowth] = useState("2");
  const [returnOnNew, setReturnOnNew] = useState("");
  const [cost, setCost] = useState("");
  const [perReceipt, setPerReceipt] = useState("1");

  // Studio's cost-of-capital table is Damodaran's, by industry name, and its
  // SIC map covers only the handful of companies in the catalog. For anyone
  // else the learner picks the closest industry: the figure is still sourced,
  // and which industry a company belongs in is a judgement anyway.
  const [industryName, setIndustryName] = useState(() => (filing.sic ? forSic(filing.sic)?.industry ?? "" : ""));
  const industry = industryName ? forIndustry(industryName) : null;
  const sourcedCost = industry ? estimate(industry) : null;

  const read = async () => {
    setReading(true);
    setProblem(null);
    try {
      const response = await fetch(`/api/studio/peer-figures?ciks=${filing.cik}`);
      const body = (await response.json()) as { companies?: CompanyFigures[]; error?: string };
      const first = body.companies?.[0];
      if (!response.ok || !first) {
        setProblem(body.error ?? "Those figures could not be read just now.");
        return;
      }
      if (first.unavailable) {
        setProblem(first.unavailable);
        return;
      }
      setCompany(first);
    } catch {
      setProblem("Those figures could not be read just now. Try again in a moment.");
    } finally {
      setReading(false);
    }
  };

  /** The company's own figures, and what they make: after-tax operating profit and its return on capital. */
  const filed = useMemo(() => {
    if (!company?.figures) return null;
    const entries: Entries = {};
    for (const figure of company.figures) entries[figure.key] = figure.value;
    const need: FigureKey[] = ["revenue", "operatingProfit", "pretaxProfit", "taxExpense", "totalDebt", "equity", "cash"];
    const absent = need.filter((key) => typeof entries[key] !== "number");
    if (absent.length) return { ok: false as const, absent };
    const pretax = entries.pretaxProfit as number;
    const taxRate = pretax > 0 ? (entries.taxExpense as number) / pretax : 0;
    const decomposition = decomposeRoic({
      sector: company.sector ?? "general",
      operatingIncome: entries.operatingProfit as number,
      effectiveTaxRate: taxRate,
      revenue: entries.revenue as number,
      totalDebt: entries.totalDebt as number,
      equity: entries.equity as number,
      cash: entries.cash as number,
    });
    return {
      ok: true as const,
      taxRate,
      nopat: (entries.operatingProfit as number) * (1 - Math.max(0, taxRate)),
      roic: isComputed(decomposition) ? decomposition.roic : null,
      roicReason: isComputed(decomposition) ? null : decomposition.reason,
      debt: entries.totalDebt as number,
      cash: entries.cash as number,
    };
  }, [company]);

  const shares = typeof company?.shares?.value === "number" ? company.shares.value : null;
  const costUsed = (num(cost) ?? (sourcedCost ? sourcedCost.costOfCapital * 100 : null) ?? 0) / 100;
  const ownReturn = filed?.ok && filed.roic !== null ? filed.roic : null;
  const returnUsed = (num(returnOnNew) ?? (ownReturn === null ? null : ownReturn * 100) ?? 0) / 100;
  const growthUsed = (num(growth) ?? 0) / 100;
  const receipt = Math.max(1, num(perReceipt) ?? 1);

  const worked = useMemo(() => {
    if (!filed?.ok || shares === null) return null;
    const base = { nopat: filed.nopat, returnOnNewCapital: returnUsed, debt: filed.debt, cash: filed.cash, shares, sharesPerReceipt: receipt };
    const still = firmValue({ ...base, costOfCapital: costUsed, growth: 0 });
    const atGrowth = firmValue({ ...base, costOfCapital: costUsed, growth: growthUsed });
    const equityStill = isValued(still) ? equityFromFirm({ ...base, firmValue: still.value }) : still;
    const equityAtGrowth = isValued(atGrowth) ? equityFromFirm({ ...base, firmValue: atGrowth.value }) : atGrowth;
    const asked = num(price);
    const paid = asked === null ? null : firmValueAtPrice({ price: asked, shares, debt: filed.debt, cash: filed.cash, sharesPerReceipt: receipt });
    const impliedByPrice =
      paid === null || !isValued(paid)
        ? paid
        : impliedGrowth({ firmValue: paid, nopat: filed.nopat, returnOnNewCapital: returnUsed, costOfCapital: costUsed });
    return {
      still,
      atGrowth,
      equityStill,
      equityAtGrowth,
      paid,
      impliedByPrice,
      grid: sensitivity(base, GROWTHS, COST_STEPS.map((step) => costUsed + step)),
    };
  }, [filed, shares, returnUsed, costUsed, growthUsed, receipt, price]);

  return (
    <>
      {tabs}
      <section aria-labelledby="section-worth" className="space-y-3">
        <h2 id="section-worth" className="text-[17px] font-semibold text-white">
          What a price for this company assumes
        </h2>
        <Link className="inline-flex min-h-11 items-center text-[13px] text-accent-cyan underline underline-offset-4" href={`/studio/valuation?company=${encodeURIComponent(filing.companyName)}`}>
          Open valuation workspace to save and compare scenarios →
        </Link>

        <StudioAside
          inline={
            <p className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-[14px] leading-6 text-slate-300">
              <span className="font-semibold text-white">What to look for. </span>
              {LOOK_FOR}
            </p>
          }
          beside={
            <Panel>
              <h2 className="text-[14px] font-semibold text-white">What to look for here</h2>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{LOOK_FOR}</p>
            </Panel>
          }
        />

        {!company ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <button type="button" onClick={() => void read()} disabled={reading} className={button}>
              {reading ? "Reading the SEC…" : "Read this company's figures"}
            </button>
            <p className="text-[13px] leading-5 text-slate-500">
              Its operating profit, tax, borrowings, cash and shares for the year it just filed, from SEC company facts.
            </p>
          </div>
        ) : null}

        {problem ? (
          <p role="alert" className="text-[13px] leading-6 text-accent-amber">
            {problem}
          </p>
        ) : null}

        {filed && !filed.ok ? (
          <p className="text-[14px] leading-6 text-accent-amber">
            This needs figures Studio could not read for {company?.name ?? "this company"}:{" "}
            {filed.absent.map(figureLabel).join(", ")}. Without them there is nothing here to value. Coca-Cola is the case
            this exists for: it tags no borrowing figure that excludes finance leases, so its capital cannot be totalled.
          </p>
        ) : null}

        {worked && filed?.ok ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Field
                label="Price someone is asking"
                hint="For one share, from your broker"
                type="number"
                min={0}
                prefix="$"
                value={price}
                onChange={setPrice}
              />
              <Field
                label="Growth you would assume"
                hint="A year, for ever"
                type="number"
                suffix="%"
                value={growth}
                onChange={setGrowth}
              />
              <Field
                label="Return on new money"
                hint={ownReturn !== null ? `It earned ${pct(ownReturn)} last year` : "Its own return could not be read"}
                type="number"
                suffix="%"
                value={returnOnNew === "" && ownReturn !== null ? (ownReturn * 100).toFixed(1) : returnOnNew}
                onChange={setReturnOnNew}
              />
              <Choice
                label="Closest industry"
                value={industryName}
                options={[{ value: "", label: "Choose one" }, ...industryNames().map((name) => ({ value: name, label: name }))]}
                onChange={(name) => {
                  setIndustryName(name);
                  setCost("");
                }}
              />
              <Field
                label="What money costs it"
                hint={sourcedCost ? `${pct(sourcedCost.costOfCapital, 2)} for this industry` : "Pick an industry, or type a rate"}
                type="number"
                suffix="%"
                value={cost === "" && sourcedCost ? (sourcedCost.costOfCapital * 100).toFixed(2) : cost}
                onChange={setCost}
              />
            </div>

            {costUsed <= 0 ? (
              <p className="text-[14px] leading-6 text-slate-400">
                Pick the closest industry above, or type what money costs this company, and the rest follows. Studio&rsquo;s
                figures are Damodaran&rsquo;s, by industry, rebuilt on the latest Treasury auction.
              </p>
            ) : (
              <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat
                label="This price assumes"
                value={
                  worked.impliedByPrice === null
                    ? "—"
                    : isValued(worked.impliedByPrice)
                      ? `${pct(worked.impliedByPrice)} growth`
                      : "no growth explains it"
                }
                detail={
                  worked.impliedByPrice === null
                    ? "Enter the price someone is asking"
                    : isValued(worked.impliedByPrice)
                      ? worked.impliedByPrice < 0
                        ? "Less than standing still: the price is below the business as it is"
                        : "Every year, for ever, bought at the return above"
                      : worked.impliedByPrice.reason
                }
              />
              <Stat
                label="Standing still, it is worth"
                value={isValued(worked.equityStill) ? perShare(worked.equityStill.perReceipt ?? worked.equityStill.perShare) : "—"}
                detail={isValued(worked.equityStill) ? "A share, with no growth at all" : worked.equityStill.reason}
              />
              <Stat
                label={`At ${pct(growthUsed)} growth`}
                value={isValued(worked.equityAtGrowth) ? perShare(worked.equityAtGrowth.perReceipt ?? worked.equityAtGrowth.perShare) : "—"}
                detail={
                  !isValued(worked.atGrowth)
                    ? worked.atGrowth.reason
                    : isValued(worked.equityAtGrowth)
                      ? `${pct(worked.atGrowth.reinvestmentRate)} of profit goes back in to buy it`
                      : worked.equityAtGrowth.reason
                }
              />
              <Stat
                label="Growth here"
                value={
                  isValued(worked.atGrowth)
                    ? worked.atGrowth.growthEffect === "adds"
                      ? "adds value"
                      : worked.atGrowth.growthEffect === "removes"
                        ? "takes value away"
                        : "changes nothing"
                    : "—"
                }
                detail={
                  returnUsed > costUsed
                    ? "New money earns more than it costs"
                    : returnUsed < costUsed
                      ? "New money earns less than it costs"
                      : "New money earns exactly what it costs"
                }
              />
            </div>

            <div className="overflow-x-auto" style={{ contain: "paint" }}>
              <table className="w-full min-w-[420px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Value per share at four growth rates and three costs of capital</caption>
                <thead>
                  <tr className="border-b border-white/10 text-[12px] text-slate-400">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Growth a year
                    </th>
                    {COST_STEPS.map((step) => (
                      <th key={step} scope="col" className="py-2 pr-3 font-medium">
                        Money costs {pct(costUsed + step, 1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {GROWTHS.map((rate, row) => (
                    <tr key={rate}>
                      <th scope="row" className="py-2 pr-3 font-semibold text-white">
                        {pct(rate, 0)}
                      </th>
                      {worked.grid[row].map((cell, column) => (
                        <td key={COST_STEPS[column]} className="py-2 pr-3 tabular-nums text-slate-200">
                          {cell === null ? <span className="text-slate-500">no answer</span> : perShare(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {worked.grid.some((row) => row.some((cell) => cell === null)) ? (
              <p className="text-[13px] leading-5 text-accent-amber">
                An empty cell is growth this business cannot pay for: at a {pct(returnUsed)} return on new money, buying that
                much growth costs more than it earns. {returnUsed < costUsed ? "New money here earns less than it costs, so growth lowers the value rather than raising it. " : ""}
                The return above is where growth has to be bought; if last year was unusual, change it and watch the grid.
              </p>
            ) : null}

            <p className="text-[13px] leading-5 text-slate-400">
              One growth rate, for ever, bought at one return on capital: that is the whole model. It is not a price target —
              a company can be worth less than this and still be a fine business.
            </p>

            <details className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
              <summary className="cursor-pointer text-[13px] font-semibold text-white">Where every figure came from</summary>
              <div className="mt-2 max-w-xs">
                <Field
                  label="Company shares behind one traded share"
                  hint="1, unless what trades is a depositary receipt — TSMC's is 5, from its filing's cover"
                  type="number"
                  min={1}
                  value={perReceipt}
                  onChange={setPerReceipt}
                />
              </div>
              <ul className="mt-2 space-y-1 text-[13px] leading-5 text-slate-400">
                <li>
                  <span className="text-slate-300">Operating profit after tax:</span> {money(filed.nopat)} — the year to{" "}
                  {company?.periodEnd}, taxed at {pct(filed.taxRate)}, the rate the company itself paid.
                </li>
                <li>
                  <span className="text-slate-300">Borrowings and cash:</span> {money(filed.debt)} and {money(filed.cash)}, so
                  the lenders&rsquo; claim nets to {money(filed.debt - filed.cash)}.
                </li>
                <li>
                  <span className="text-slate-300">Shares:</span> {shares === null ? "not read" : shares.toLocaleString("en-US")} —{" "}
                  {company?.shares?.concept ?? "unknown tag"}, the year&rsquo;s diluted average. Buybacks or issues since then are
                  not in it.
                </li>
                <li>
                  <span className="text-slate-300">Return on new money:</span> {pct(returnUsed)} — starting from what it earned
                  on the capital it already has. Whether the next dollar earns the same is your judgement, not a fact.
                </li>
                <li>
                  <span className="text-slate-300">What money costs:</span> {pct(costUsed, 2)}
                  {sourcedCost ? ` — ${sourcedCost.provenance[0]}` : " — typed in, with no industry match"}
                </li>
              </ul>
            </details>
              </>
            )}
          </>
        ) : null}
      </section>
    </>
  );
}
