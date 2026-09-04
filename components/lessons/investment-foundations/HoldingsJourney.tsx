"use client";

import { useMemo, useState } from "react";
import ValuationJourneyShell, {
  type ValuationStage,
} from "./ValuationJourneyShell";
import ChoiceGroup from "./ChoiceGroup";
import {
  IDENTITY_CONFLICTS,
  PRODUCTS,
  RECORDED_OVERLAP,
  RETRIEVED_AT,
  VTI_SHARE_CLASSES,
  lookThrough,
  stalenessDays,
  type IssuerKeyMode,
  type Passport,
} from "@/lib/holdings-slate";
import {
  EMPTY_HOLDINGS_SLATE,
  EMPTY_ORDER_DRAFT,
  frictionOneWayPct,
  isHoldingsSlateComplete,
  useIFProgress,
  type HoldingsSlate,
} from "@/lib/if-progress";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-pb-12-choose-the-actual-holdings";

/**
 * Stage-completion behaviour, declared for the typography gate's stage walker
 * (see docs/lesson-plans/missions-10-13-forward-plan.md §1.3): this journey does
 * **not** auto-advance on save. Every stage is completed by its own primary
 * control, and the walker can satisfy each one by choosing any radio option —
 * no stage requires a correct answer to proceed, and the order rehearsal ships
 * with a default amount so no stage requires typing. `ANSWER_KEYS` should stay
 * empty for this lesson. Eight stages since the screen-budget split.
 */
const STAGES: readonly ValuationStage[] = [
  {
    label: "Identity",
    title: "A ticker is not a product",
    guide:
      "You think you are buying VTI. Ask the SEC what VTI is and it has never heard of it — because no such filer exists. What exists is a trust, a fund inside it, and a share class you can buy.",
    instruction: "Look the ticker up, then read what actually came back.",
    next: "Continue to the passport",
  },
  {
    label: "Passport",
    title: "Everything one filing will tell you",
    guide:
      "This is a complete product record, and every line is pinned to the filing that answers it. Read it once here, because in a moment you will build one yourself.",
    instruction: "Read the passport, then meet the fund that looks identical.",
    next: "Continue to the filing",
  },
  {
    label: "Filing",
    title: "Find one fact at a time",
    guide:
      "A different fund, a different sponsor, and an empty passport. Each question below is answered somewhere in this filing. Pick the passage you think answers it and watch the field fill.",
    instruction:
      "Answer all five. A wrong pick fills the field with a wrong value rather than a red cross — read what you produced.",
    next: "Continue to the X-ray",
  },
  {
    label: "X-ray",
    title: "What you actually own",
    guide:
      "Your growth sleeve holds two funds. Both are cheap, both are broad, and holding both feels like diversifying. The look-through asks a different question: which companies do you end up owning, and through how many routes?",
    instruction: "Choose the key the look-through runs on, then read the table.",
    next: "Continue to the finding",
  },
  {
    label: "Repair",
    title: "Two funds, one portfolio",
    guide:
      "The table you just read has a headline, and it is not a small one. Here is the number, and here is what to do about it.",
    instruction: "Read the finding, then repair the slate.",
    next: "Continue to the checks",
  },
  {
    label: "Checks",
    title: "Three things that look fine",
    guide:
      "Every figure here is real, filed and audited. That is not the same as meaning what it appears to mean.",
    instruction: "Answer all three.",
    next: "Continue to the order",
  },
  {
    label: "Order",
    title: "Build the order draft",
    guide:
      "A draft, and only a draft. There is no submit button in this lesson because there is nothing to submit to — no endpoint exists.",
    instruction: "Name the product exactly, then say how you would place it.",
    next: "Continue to save",
  },
  {
    label: "Save",
    title: "Save the Holdings Slate",
    guide:
      "This becomes the slate later missions check against. The flight test and the operating plan both read it.",
    instruction: "Review the draft, then save it to the dossier.",
    next: "Return to Investment Foundations",
  },
];

// ---------------------------------------------------------------------------
// Small shared presentation helpers. The radiogroup itself now lives in
// ChoiceGroup.tsx, which both this mission and Mission 11 use.
// ---------------------------------------------------------------------------

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-white/8 py-2 sm:flex-row sm:gap-3">
      <dt className="w-full flex-shrink-0 text-[13px] text-slate-400 sm:w-52 sm:text-[15px]">
        {term}
      </dt>
      <dd className="min-w-0 text-[15px] text-white">{children}</dd>
    </div>
  );
}

/** Wide tables scroll inside themselves; the page never scrolls sideways. */
function TableScroll({ children }: { children: React.ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}

function Provenance({ product }: { product: Passport }) {
  const stale = stalenessDays(product.holdings.asOf, RETRIEVED_AT);
  return (
    <p className="text-[13px] leading-6 text-slate-400">
      Prospectus: {product.prospectus.form} {product.prospectus.accession}, dated{" "}
      {product.prospectus.dated}. Holdings: N-PORT {product.holdings.accession},
      as of <span className="tabular-nums">{product.holdings.asOf}</span> —{" "}
      <span className="tabular-nums">{stale}</span> days old when retrieved on{" "}
      <span className="tabular-nums">{RETRIEVED_AT}</span>. Quarterly holdings are
      not live holdings.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Stage 0 — identity
// ---------------------------------------------------------------------------

function StageIdentity({ onComplete }: { onComplete: () => void }) {
  const [looked, setLooked] = useState(false);
  const vti = PRODUCTS.VTI;

  return (
    <div className="space-y-5">
      <div className="ops-definition-card p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          EDGAR company search
        </div>
        <button
          type="button"
          onClick={() => setLooked(true)}
          className="mt-3 min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          Look up &ldquo;VTI&rdquo;
        </button>

        {looked ? (
          <div className="mt-4 space-y-3" aria-live="polite">
            <p className="ops-body-strong text-[16px] text-white">
              No filer found for &ldquo;VTI&rdquo;.
            </p>
            <p className="text-[15px] leading-7 text-slate-300">
              That is the correct result, not a broken search. No entity called VTI
              files with the SEC. Three things exist instead, and only the last one
              is what you buy.
            </p>
          </div>
        ) : null}
      </div>

      {looked ? (
        <>
          <ol className="space-y-2">
            {[
              {
                k: "The filer",
                v: vti.registrant,
                id: `CIK ${vti.cik}`,
                note: "A trust. It files the paperwork and it is not a fund.",
              },
              {
                k: "The fund",
                v: vti.legalSeriesName,
                id: vti.seriesId,
                note: "One portfolio, one manager, one turnover figure. This is the thing that holds the shares.",
              },
              {
                k: "What you buy",
                v: `${vti.className} (${vti.ticker})`,
                id: vti.classId,
                note: "A share class. It is one of six ways to own the fund above.",
              },
            ].map((step, i) => (
              <li
                key={step.k}
                className="rounded-xl border border-white/12 bg-white/[0.02] p-4"
              >
                <div className="ops-caption text-[12px] text-slate-400">
                  Level {i + 1} · {step.k}
                </div>
                <div className="ops-body-strong mt-1 text-[16px] text-white">
                  {step.v}
                </div>
                <div className="mt-1 text-[13px] tabular-nums text-accent-amber">
                  {step.id}
                </div>
                <p className="mt-2 text-[14px] leading-6 text-slate-300">
                  {step.note}
                </p>
              </li>
            ))}
          </ol>

          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              Six tickers, one portfolio
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-300">
              Every row below is the same fund — {vti.legalSeriesName}, series{" "}
              {vti.seriesId}. They differ in what they cost you and who is allowed
              to buy them.
            </p>
            <TableScroll>
              <table className="mt-3 w-full min-w-[30rem] text-left text-[14px]">
                <caption className="sr-only">
                  Share classes of series {vti.seriesId}
                </caption>
                <thead className="text-slate-400">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-normal">Class</th>
                    <th scope="col" className="py-2 pr-3 font-normal">Ticker</th>
                    <th scope="col" className="py-2 pr-3 font-normal">Class ID</th>
                    <th scope="col" className="py-2 pr-3 text-right font-normal">Expense</th>
                    <th scope="col" className="py-2 text-right font-normal">Minimum</th>
                  </tr>
                </thead>
                <tbody>
                  {VTI_SHARE_CLASSES.map((c) => {
                    const highlight = c.ticker === "VTI" || c.ticker === "VTSAX";
                    return (
                      <tr
                        key={c.classId}
                        className={cn(
                          "border-t border-white/8",
                          highlight && "bg-accent-amber/10",
                        )}
                      >
                        <td className="py-2 pr-3 text-white">{c.className}</td>
                        <td className="py-2 pr-3 text-white">{c.ticker}</td>
                        <td className="py-2 pr-3 tabular-nums text-slate-300">
                          {c.classId}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums text-white">
                          {c.totalExpensePct === null ? "—" : `${c.totalExpensePct.toFixed(2)}%`}
                        </td>
                        <td className="py-2 text-right tabular-nums text-slate-300">
                          {c.minimumUsd === null
                            ? "None"
                            : `$${c.minimumUsd.toLocaleString("en-US")}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
            <p className="mt-3 text-[14px] leading-6 text-slate-300">
              VTI and VTSAX are not similar products. They are the{" "}
              <strong className="text-white">same series</strong> — the same
              portfolio, filed under one series ID. Only the class ID tells them
              apart, and the difference costs you 0.01% a year and a $3,000 minimum.
            </p>
            <p className="mt-2 text-[13px] text-slate-400">
              Read from the share-class table in the SGML header of Vanguard&rsquo;s
              485BPOS, accession 0000036405-26-000181, filed 2026-04-28.
            </p>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
          >
            I can tell a filer, a fund and a share class apart
          </button>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 1 — the modelled passport
// ---------------------------------------------------------------------------

function StagePassport({ onComplete }: { onComplete: () => void }) {
  const p = PRODUCTS.VTI;
  const stale = stalenessDays(p.holdings.asOf, RETRIEVED_AT);

  return (
    <div className="space-y-5">
      <p className="ops-body text-[16px] leading-7 text-slate-200">
        A number without a source and a date is not evidence, so every line names
        the filing it came from.
      </p>

      <div className="ops-definition-card p-5">
        <div className="ops-caption text-[12px] text-accent-amber">Fund Passport</div>
        <h3 className="ops-body-strong mt-1 text-[16px] text-white">
          {p.legalSeriesName} — {p.className} ({p.ticker})
        </h3>
        {/*
          The nine fields that decide whether a product fits a sleeve stay on
          screen; the rest of the record goes behind a disclosure. Measured, the
          full fifteen-row list put this stage at 3.21 screens at 1440 and 5.51
          at 390, against the Screen Budget Rule's 1.5. Splitting it also says
          something true: these nine are the ones you act on.
        */}
        <dl className="mt-3">
          <Row term="Legal name">{p.legalSeriesName}</Row>
          <Row term="Share class">
            {p.className} · <span className="tabular-nums">{p.classId}</span>
          </Row>
          <Row term="Structure">
            {p.structure} Listed on {p.listing}.
          </Row>
          <Row term="Tracks">{p.targetIndex}</Row>
          <Row term="Replication">
            <span className="ops-body-strong text-white">
              {p.replication === "full" ? "Full replication" : "Sampled"}
            </span>
          </Row>
          <Row term="Total expense">
            <span className="tabular-nums">{p.totalExpensePct.toFixed(2)}%</span> —{" "}
            <span className="tabular-nums">${p.costPer10kUsd[3]}</span> per $10,000
            over ten years
          </Row>
          <Row term="Turnover">
            <span className="tabular-nums">{p.turnoverPct}%</span> in the most recent
            fiscal year
          </Row>
          <Row term="Holdings as of">
            <span className="tabular-nums">{p.holdings.asOf}</span> —{" "}
            <span className="tabular-nums">{stale}</span> days old at retrieval,{" "}
            <span className="tabular-nums">
              {p.holdings.positions.toLocaleString("en-US")}
            </span>{" "}
            positions summing to{" "}
            <span className="tabular-nums">{p.holdings.weightSumPct}%</span>
          </Row>
        </dl>

        <details className="group mt-3 border-t border-white/8 pt-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-semibold text-slate-300">
            <span>The rest of the record</span>
            <span className="text-[13px] font-normal text-slate-400 group-open:hidden">
              Filer, objective, risks, tracking, lending, spread
            </span>
            <span className="hidden text-[13px] font-normal text-slate-400 group-open:inline">
              Hide
            </span>
          </summary>
          <dl className="mt-2">
            <Row term="Filer">
              {p.registrant} · <span className="tabular-nums">CIK {p.cik}</span>
            </Row>
            <Row term="Objective">{p.objective}</Row>
            <Row term="Replication, as filed">
              &ldquo;{p.replicationSentence}&rdquo;
            </Row>
            <Row term="Principal risks">
              {p.principalRiskCount} named, including{" "}
              {p.riskHighlights[0].toLowerCase()}
            </Row>
            <Row term="Tracking">
              Over ten years the fund returned{" "}
              <span className="tabular-nums">{p.returns[2].fundPct.toFixed(2)}%</span>{" "}
              against its index&rsquo;s{" "}
              <span className="tabular-nums">
                {p.returns[2].benchmarkPct.toFixed(2)}%
              </span>
              . Periods ended 2025-12-31.
            </Row>
            <Row term="Securities lending">
              {p.lendingPermitted ?? "No lending programme described"} ·{" "}
              {p.lendingObservedPositions} positions on loan in this filing
            </Row>
            <Row term="Leverage, inverse, margin">
              None described anywhere in the filing — a finding, not an omission.
            </Row>
            <Row term="Material changes">{p.materialChanges}</Row>
            <Row term="Spread and premium">
              Described but not quantified. No filing in this slate publishes a
              bid-ask spread or premium/discount figure.
            </Row>
          </dl>
        </details>
      </div>

      <Provenance product={p} />

      <p className="ops-body text-[15px] leading-7 text-slate-300">
        The passport reports fields. It does not score, rank or recommend — whether
        this fund belongs in your portfolio was settled in Mission 10, when you
        licensed the sleeve.
      </p>

      <button
        type="button"
        onClick={onComplete}
        className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
      >
        Now let me fill one in
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 2 — the Prospectus Lens, guided
// ---------------------------------------------------------------------------

type Find = {
  id: string;
  field: string;
  question: string;
  options: { id: string; passage: string; fills: string; wrong?: string }[];
};

const AGG_FINDS: Find[] = [
  {
    id: "replication",
    field: "Replication",
    question: "How does this fund track its index?",
    options: [
      {
        id: "a",
        passage:
          "BFA uses a representative sampling indexing strategy to manage the Fund… The Fund may or may not hold all of the components of the Underlying Index.",
        fills: "Sampled — the fund need not hold every index security",
      },
      {
        id: "b",
        passage:
          "The Fund seeks to track the investment results of the Bloomberg U.S. Aggregate Bond Index, which measures the performance of the total U.S. investment-grade bond market.",
        fills: "Tracks the Bloomberg U.S. Aggregate Bond Index",
        wrong:
          "That is the index it tracks, not how it tracks it. The passport still has no replication method, so nothing tells you whether the fund holds all 13,972 issues or a sample of them.",
      },
      {
        id: "c",
        passage:
          "The Fund will invest at least 80% of its assets in the component securities of the Underlying Index and TBAs…",
        fills: "At least 80% in index components",
        wrong:
          "That is a minimum allocation, not a replication method. A fund can hold 80% of its assets in index securities while holding only a fraction of the securities in the index.",
      },
    ],
  },
  {
    id: "fee",
    field: "Total expense",
    question: "What does the fund charge each year?",
    options: [
      {
        id: "a",
        passage: "Total Annual Fund Operating Expenses — 0.03%",
        fills: "0.03%",
      },
      {
        id: "b",
        passage: "Example Fund Costs — 1 Year $3 · 3 Years $10 · 5 Years $17 · 10 Years $39",
        fills: "$3 in the first year",
        wrong:
          "That is the cost example, which assumes a $10,000 investment and a 5% return. It is derived from the expense ratio; it is not the ratio, and it does not scale to your balance.",
      },
      {
        id: "c",
        passage:
          "BFA will pay all operating expenses of the Fund, except: (i) the management fees, (ii) interest expenses, (iii) taxes…",
        fills: "The adviser pays operating expenses",
        wrong:
          "True, and it explains why Other Expenses reads 0.00% — but it is the fee structure, not the fee. The passport still has no number in it.",
      },
    ],
  },
  {
    id: "turnover",
    field: "Turnover",
    question: "How much of the portfolio was traded last year?",
    options: [
      {
        id: "a",
        passage:
          "During the most recent fiscal year, the Fund's portfolio turnover rate was 62% of the average value of its portfolio.",
        fills: "62%",
      },
      {
        id: "b",
        passage:
          "Indexing seeks to achieve lower costs and better after-tax performance by aiming to keep portfolio turnover low in comparison to actively managed investment companies.",
        fills: "Low, compared with active funds",
        wrong:
          "That is a description of indexing in general, with no number attached. The filing states an actual rate a few lines earlier.",
      },
      {
        id: "c",
        passage: "As of February 28, 2026, there were 13,972 issues in the Underlying Index.",
        fills: "13,972",
        wrong:
          "That is the size of the index, not the fund's trading. It is a useful number — it is what makes sampling visible — but it does not belong in this field.",
      },
    ],
  },
  {
    id: "lending",
    field: "Securities lending",
    question: "How much of the fund may be lent out?",
    options: [
      {
        id: "a",
        passage:
          "The Fund may lend securities representing up to one-third of the value of the Fund's total assets (including the value of any collateral received).",
        fills: "Permitted: up to one-third of total assets",
      },
      {
        id: "b",
        passage: "Securities Lending Risk.",
        fills: "Securities lending is a principal risk",
        wrong:
          "The risk heading tells you lending is material enough to disclose, but not how much of the fund can be lent. A limit you cannot state is not a limit you have read.",
      },
      {
        id: "c",
        passage:
          "Positions flagged on loan in the most recent N-PORT filing: 0.",
        fills: "Observed: none on loan",
        wrong:
          "That is what the fund was actually doing on one date — worth knowing, and a different field. What the prospectus permits and what the holdings file observed are two separate facts, and this mission keeps them apart.",
      },
    ],
  },
  {
    id: "asof",
    field: "Holdings as of",
    question:
      "The holdings file carries two dates. Which one tells you when these holdings were true?",
    options: [
      {
        id: "a",
        passage: "repPdDate — 2026-05-31",
        fills: "2026-05-31",
      },
      {
        id: "b",
        passage: "repPdEnd — 2027-02-28",
        fills: "2027-02-28",
        wrong:
          "That is the fund's fiscal year end, not its holdings date — and look at what you just wrote into the passport. It is in the future. A fund cannot report what it held on a date that has not happened.",
      },
      {
        id: "c",
        passage: "Filed with the SEC — 2026-07-24",
        fills: "2026-07-24",
        wrong:
          "That is when the document arrived at the SEC, which is nearly two months after the holdings it describes. Filing date and as-of date are never the same thing, and the gap is the whole point.",
      },
    ],
  },
];

function StageLens({
  picks,
  setPicks,
  onComplete,
}: {
  picks: Record<string, string>;
  setPicks: (p: Record<string, string>) => void;
  onComplete: () => void;
}) {
  /**
   * One field at a time. Stacking all five find-cards put this stage at 3.9
   * screens at 1440 and 6.3 at 390 — measured, not estimated — against the
   * Screen Budget Rule's 1.5. A filing is long; the Lens is the thing that
   * makes it short.
   */
  const [idx, setIdx] = useState(0);
  const find = AGG_FINDS[idx];
  const picked = find.options.find((o) => o.id === picks[find.id]);
  const isLast = idx === AGG_FINDS.length - 1;
  const answered = AGG_FINDS.every((f) => picks[f.id]);
  const agg = PRODUCTS.AGG;

  return (
    <div className="space-y-4">
      <p className="ops-body text-[16px] leading-7 text-slate-200">
        This is {agg.legalSeriesName} — a different sponsor, a different asset
        class, and a filing written to a different house style. The facts are in
        there.
      </p>

      {idx > 0 ? (
        <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
          <h3 className="ops-body-strong text-[15px] text-white">
            Passport so far
          </h3>
          <dl className="mt-2">
            {AGG_FINDS.slice(0, idx).map((f) => {
              const p = f.options.find((o) => o.id === picks[f.id]);
              return (
                <div
                  key={f.id}
                  className="flex flex-col gap-0.5 border-t border-white/8 py-1.5 text-[14px] sm:flex-row sm:gap-3"
                >
                  <dt className="w-full flex-shrink-0 text-slate-400 sm:w-44">
                    {f.field}
                  </dt>
                  <dd className="min-w-0 text-white">{p?.fills ?? "—"}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : null}

      <div className="ops-definition-card p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          Field {idx + 1} of {AGG_FINDS.length} · {find.field}
        </div>
        <h3 className="ops-body-strong mt-1 text-[16px] leading-7 text-white">
          {find.question}
        </h3>
        <ChoiceGroup
          label={find.question}
          className="mt-3 space-y-2"
          value={picks[find.id] ?? ""}
          onChange={(id) => setPicks({ ...picks, [find.id]: id })}
          options={find.options.map((o) => ({ id: o.id, label: o.passage }))}
        />

        {picked ? (
          <div
            className="mt-3 rounded-xl border border-white/12 bg-white/[0.03] p-4"
            aria-live="polite"
          >
            <div className="ops-caption text-[12px] text-slate-400">
              Your passport now reads
            </div>
            <p className="ops-body-strong mt-1 text-[16px] text-white">
              {find.field}: {picked.fills}
            </p>
            {picked.wrong ? (
              <p className="mt-2 text-[14px] leading-6 text-slate-300">
                {picked.wrong}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {isLast ? (
        <button
          type="button"
          disabled={!answered}
          onClick={onComplete}
          className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          {answered ? "Continue to the X-ray" : "Answer this field to continue"}
        </button>
      ) : (
        <button
          type="button"
          disabled={!picked}
          onClick={() => setIdx(idx + 1)}
          className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          {picked ? "Next field" : "Pick a passage to continue"}
        </button>
      )}

      <Provenance product={agg} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stages 3 and 4 — the Overlap X-Ray, split
// ---------------------------------------------------------------------------

/**
 * Stages 4 and 5 were one stage until measurement put it at 1.92 screens of
 * content against the Screen Budget Rule's 1.5. `AGENTS.md` prescribes the
 * remedy — a stage that overruns is split, never sealed inside a scroll box —
 * so the look-through and the finding it produces are now separate screens.
 * It also reads better: the learner explores the table, then meets the headline.
 */
function StageLookThrough({
  keyMode,
  setKeyMode,
  onComplete,
}: {
  keyMode: IssuerKeyMode;
  setKeyMode: (m: IssuerKeyMode) => void;
  onComplete: () => void;
}) {
  const mode: IssuerKeyMode = keyMode;
  // Slate and look-through are derived together so the table can never be
  // computed from a different slate than the one the header names.
  const { slate, view } = useMemo(() => {
    const next = [
      { ticker: "VTI", weightPct: 60 },
      { ticker: "VOO", weightPct: 40 },
    ];
    return { slate: next, view: lookThrough(next, mode) };
  }, [mode]);

  return (
    <div className="space-y-4">
      <div className="ops-definition-card p-5">
        <h3 className="ops-body-strong text-[16px] text-white">
          Aggregate exposure by
        </h3>
        <ChoiceGroup
          label="Issuer key"
          className="mt-3 grid gap-2 sm:grid-cols-2"
          value={mode}
          onChange={setKeyMode}
          options={[
            {
              id: "instrument" as const,
              label: "Instrument (CUSIP)",
              hint: "One row per security, as filed.",
            },
            {
              id: "issuer" as const,
              label: "Issuer (LEI)",
              hint: "One row per company, however many securities it issued.",
            },
          ]}
        />
        <p className="mt-3 text-[14px] leading-6 text-slate-300">
          Alphabet files two share classes: two CUSIPs, one LEI. On the instrument
          key it appears twice and ranks fifth; on the issuer key it is one company
          and ranks third. Only one of those tells you your exposure to Alphabet.
        </p>
      </div>

      <div className="ops-definition-card p-5">
        <h3 className="ops-body-strong text-[16px] text-white">
          Look-through — 60% VTI + 40% VOO
        </h3>
        <TableScroll>
          <table className="mt-3 w-full min-w-[32rem] text-left text-[14px]">
            <caption className="sr-only">
              Blended exposure by {mode === "issuer" ? "issuer" : "instrument"}
            </caption>
            <thead className="text-slate-400">
              <tr>
                <th scope="col" className="py-2 pr-3 font-normal">
                  {mode === "issuer" ? "Issuer" : "Security"}
                </th>
                {slate.map((s) => (
                  <th
                    key={s.ticker}
                    scope="col"
                    className="py-2 pr-3 text-right font-normal"
                  >
                    via {s.ticker}
                  </th>
                ))}
                <th scope="col" className="py-2 text-right font-normal">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {view.rows.slice(0, 5).map((r) => (
                <tr key={r.key} className="border-t border-white/8">
                  <td className="py-2 pr-3 text-white">
                    {r.name}
                    {r.uncovered ? (
                      <span className="ml-2 text-[12px] text-accent-amber">
                        no LEI filed
                      </span>
                    ) : null}
                  </td>
                  {slate.map((s) => {
                    const via = r.viaFund.find((v) => v.ticker === s.ticker);
                    return (
                      <td
                        key={s.ticker}
                        className="py-2 pr-3 text-right tabular-nums text-slate-300"
                      >
                        {via ? `${via.pct.toFixed(2)}%` : "—"}
                      </td>
                    );
                  })}
                  <td className="py-2 text-right tabular-nums text-white">
                    {r.totalPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>

        <p className="mt-3 text-[13px] leading-6 text-slate-400">
          Covers{" "}
          <span className="tabular-nums text-white">
            {view.coveragePct.toFixed(1)}%
          </span>{" "}
          of the money in the slate; the rest is each fund&rsquo;s long tail, not
          shown and not zero. Holdings as of {view.asOfDates.join(" and ")}. Weights
          inside each fund sum to {PRODUCTS.VTI.holdings.weightSumPct}% and{" "}
          {PRODUCTS.VOO.holdings.weightSumPct}%, not 100% — left in rather than
          scaled away.
        </p>
      </div>

      {/* Supporting evidence for the toggle above, not the finding itself —
          behind a disclosure so this stage stays inside the screen budget. */}
      <details className="ops-definition-card group p-5">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold text-white">
          <span>Why neither key is the right answer</span>
          <span className="text-[13px] font-normal text-slate-400 group-open:hidden">
            One CUSIP, three names, two LEIs
          </span>
          <span className="hidden text-[13px] font-normal text-slate-400 group-open:inline">
            Hide
          </span>
        </summary>
        <p className="mt-2 text-[15px] leading-7 text-slate-300">
          One CUSIP in this slate, {IDENTITY_CONFLICTS[0].cusip}, is filed under
          three different names and two different legal-entity identifiers — by two
          funds from the same sponsor, on the same day.
        </p>
        <TableScroll>
          <table className="mt-3 w-full min-w-[30rem] text-left text-[14px]">
            <caption className="sr-only">
              The same CUSIP filed under different identities
            </caption>
            <thead className="text-slate-400">
              <tr>
                <th scope="col" className="py-2 pr-3 font-normal">Fund</th>
                <th scope="col" className="py-2 pr-3 font-normal">Name as filed</th>
                <th scope="col" className="py-2 font-normal">LEI</th>
              </tr>
            </thead>
            <tbody>
              {IDENTITY_CONFLICTS.map((c, i) => (
                <tr key={`${c.fund}-${i}`} className="border-t border-white/8">
                  <td className="py-2 pr-3 text-white">{c.fund}</td>
                  <td className="py-2 pr-3 text-slate-300">{c.name}</td>
                  <td className="py-2 tabular-nums text-slate-300">
                    {c.lei ?? "none filed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        <p className="mt-3 text-[14px] leading-6 text-slate-300">
          The instrument key finds this overlap and misses the Treasury one. The
          issuer key does the reverse. This X-ray keys on LEI, falls back to CUSIP
          when no LEI was filed, and counts what it could not match rather than
          dropping it — because an exposure you cannot identify is still an exposure
          you hold.
        </p>
      </details>

      <button
        type="button"
        onClick={onComplete}
        className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
      >
        Continue to the finding
      </button>
    </div>
  );
}

function StageRepair({
  keyMode,
  repaired,
  setRepaired,
  onComplete,
}: {
  keyMode: IssuerKeyMode;
  repaired: boolean;
  setRepaired: (v: boolean) => void;
  onComplete: () => void;
}) {
  const mode: IssuerKeyMode = keyMode;
  const pair = RECORDED_OVERLAP.find(
    (r) => r.inner === (repaired ? "AGG" : "VOO") && r.outer === "VTI",
  );

  return (
    <div className="space-y-4">
      {pair ? (
        <div className="ops-definition-card p-5">
          <h3 className="ops-caption text-[12px] text-accent-amber">
            Recorded from the complete filings
          </h3>
          <p className="ops-body-strong mt-1 text-[18px] leading-7 text-white">
            {mode === "issuer" ? pair.byIssuerPct : pair.byInstrumentPct}% of{" "}
            {pair.inner} sits inside VTI
          </p>
          <p className="mt-2 text-[15px] leading-7 text-slate-300">{pair.note}</p>
          {!pair.datesAligned ? (
            <p className="mt-2 text-[14px] leading-6 text-accent-amber">
              These two funds report on different dates —{" "}
              {PRODUCTS[pair.inner].holdings.asOf} against{" "}
              {PRODUCTS[pair.outer].holdings.asOf}. The sponsors run different
              fiscal calendars, so this figure mixes two snapshots and there is no
              common one to use instead.
            </p>
          ) : (
            <p className="mt-2 text-[14px] leading-6 text-slate-400">
              Both funds report as of {PRODUCTS[pair.inner].holdings.asOf}, so this
              comparison does not mix snapshots.
            </p>
          )}
        </div>
      ) : null}

      {!repaired ? (
        <div className="ops-definition-card p-5">
          <h3 className="ops-body-strong text-[16px] text-white">
            Two funds. One portfolio.
          </h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-300">
            Holding VTI and VOO together does not spread your growth sleeve across
            two things. It buys the largest US companies twice. Repair the slate by
            putting the second 40% into a sleeve that is actually different.
          </p>
          <button
            type="button"
            onClick={() => setRepaired(true)}
            className="mt-3 min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
          >
            Replace VOO with AGG in the stability sleeve
          </button>
        </div>
      ) : (
        <div className="ops-definition-card p-5">
          <h3 className="ops-body-strong text-[16px] text-white">
            Better — and still not zero.
          </h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-300">
            On the instrument key, a stock fund and a bond fund share nothing: 0.00%.
            Switch the key to issuer and 14.94% of AGG turns out to be debt issued by
            companies whose shares VTI already owns — JPMorgan, Bank of America,
            Morgan Stanley, Oracle, Amazon. Your stability sleeve lends money to the
            same companies your growth sleeve owns.
          </p>
          <p className="mt-2 text-[14px] leading-6 text-slate-400">
            That is not a reason to avoid either fund. It is a reason to know the
            number before you call the portfolio diversified.
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={!repaired}
        onClick={onComplete}
        className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
      >
        {repaired ? "Continue to the checks" : "Repair the slate to continue"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 5 — perturbations
// ---------------------------------------------------------------------------

type Check = {
  id: string;
  question: string;
  options: { id: string; label: string; hint?: string }[];
  reveal: React.ReactNode;
};

function StageChecks({
  answers,
  setAnswers,
  onComplete,
}: {
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  onComplete: () => void;
}) {
  const sgov = PRODUCTS.SGOV;
  const agg = PRODUCTS.AGG;
  const vti = PRODUCTS.VTI;

  const checks: Check[] = [
    {
      id: "turnover",
      question: `${agg.ticker} reports ${agg.turnoverPct}% turnover. ${sgov.ticker} reports ${sgov.turnoverPct}%. Which fund trades less?`,
      options: [
        { id: "sgov", label: `${sgov.ticker} — it barely trades at all` },
        { id: "agg", label: `${agg.ticker} — 62% is the lower figure once you adjust` },
        { id: "neither", label: "Neither — one of these numbers is not measuring trading" },
      ],
      reveal: (
        <>
          <p className="ops-body-strong text-[16px] text-white">
            0 of 24 positions were included in the calculation.
          </p>
          <p className="mt-2 text-[15px] leading-7 text-slate-300">
            Form N-1A, Item 3 instruction (d)(ii), tells the fund to{" "}
            <em>
              exclude from both the numerator and the denominator amounts relating
              to all securities, including options, whose maturities or expiration
              dates at the time of acquisition were one year or less
            </em>
            . Every security {sgov.ticker} owns matures within three months. All of
            them are excluded, so the rate is 0% by construction.
          </p>
          <p className="mt-2 text-[15px] leading-7 text-slate-300">
            The figure is real, correctly filed and audited. It measures nothing
            about this fund. Reading a filing means knowing what a number is defined
            to measure before you compare it to another one.
          </p>
        </>
      ),
    },
    {
      id: "diversified",
      question:
        "A learner's growth sleeve holds 60% VTI and 40% VOO. They say it is diversified across two funds. What is wrong?",
      options: [
        { id: "fees", label: "Nothing — both funds are cheap and broad" },
        { id: "overlap", label: "Almost all of the second fund is inside the first" },
        { id: "count", label: "Two funds is too few to be diversified" },
      ],
      reveal: (
        <p className="text-[15px] leading-7 text-slate-300">
          99.88% of VOO&rsquo;s reported weight is held by VTI as well. Exactly two
          of VOO&rsquo;s positions are not in VTI. The sleeve is not diversified
          across two funds; it is concentrated in one portfolio bought twice. Fund
          count is not a diversification measure — issuer exposure is.
        </p>
      ),
    },
    {
      id: "stale",
      question: `VTI's holdings are as of ${vti.holdings.asOf}, which was ${stalenessDays(vti.holdings.asOf, RETRIEVED_AT)} days before they were retrieved. What does that let you say?`,
      options: [
        {
          id: "nothing",
          label: "Nothing — the data is too old to use",
        },
        {
          id: "everything",
          label: "Everything — index funds barely change, so it is still current",
        },
        {
          id: "some",
          label:
            "That the funds overlapped heavily on that date, but not what either holds today",
        },
      ],
      reveal: (
        <p className="text-[15px] leading-7 text-slate-300">
          Stale data is neither useless nor current. A quarterly holdings file
          supports statements about the date it covers — and the structural finding,
          that one broad index fund contains a narrower one, is not the kind of thing
          that reverses in a quarter. What it cannot support is a claim about today&rsquo;s
          weights, or a precise figure quoted without its date. Say which you are
          making.
        </p>
      ),
    },
  ];

  /** One check at a time, for the same screen-budget reason as the Lens. */
  const [idx, setIdx] = useState(0);
  const check = checks[idx];
  const isLast = idx === checks.length - 1;
  const chosen = Boolean(answers[check.id]);
  const answered = checks.every((c) => answers[c.id]);

  return (
    <div className="space-y-4">
      <div className="ops-definition-card p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          Check {idx + 1} of {checks.length}
        </div>
        <h3 className="ops-body-strong mt-1 text-[16px] leading-7 text-white">
          {check.question}
        </h3>
        <ChoiceGroup
          label={check.question}
          className="mt-3 space-y-2"
          value={answers[check.id] ?? ""}
          onChange={(id) => setAnswers({ ...answers, [check.id]: id })}
          options={check.options}
        />
        {chosen ? (
          <div
            className="mt-3 rounded-xl border border-white/12 bg-white/[0.03] p-4"
            aria-live="polite"
          >
            {check.reveal}
          </div>
        ) : null}
      </div>

      {isLast ? (
        <button
          type="button"
          disabled={!answered}
          onClick={onComplete}
          className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          {answered ? "Continue to the order" : "Answer this check to continue"}
        </button>
      ) : (
        <button
          type="button"
          disabled={!chosen}
          onClick={() => setIdx(idx + 1)}
          className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
        >
          {chosen ? "Next check" : "Answer to continue"}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stages 6 and 7 — order rehearsal and save, split
// ---------------------------------------------------------------------------

/**
 * Building the draft and saving it were one stage until measurement put it at
 * 1.96 screens of content. Split per the Screen Budget Rule. The safety
 * property is unchanged and is structural: there is no submit control in either
 * stage, because `OrderDraft.transmitted` is typed `false` and no submission
 * endpoint exists anywhere in the product.
 */
function StageOrder({
  slate,
  setSlate,
  onComplete,
}: {
  slate: HoldingsSlate;
  setSlate: (s: HoldingsSlate) => void;
  onComplete: () => void;
}) {
  const order = slate.orderDraft;
  const setOrder = (patch: Partial<HoldingsSlate["orderDraft"]>) =>
    setSlate({ ...slate, orderDraft: { ...order, ...patch } });

  const ready =
    Boolean(order.classId.trim()) &&
    order.direction !== "" &&
    order.orderType !== "" &&
    order.approxAmountUsd > 0;

  return (
    <div className="space-y-4">
      <div className="ops-definition-card p-5">
        <h3 className="ops-body-strong text-[16px] text-white">
          Identify the product
        </h3>
        <p className="mt-1 text-[14px] leading-6 text-slate-400">
          A ticker is not an identity. Choose the share class.
        </p>
        <ChoiceGroup
          label="Product to rehearse"
          className="mt-3 grid gap-2 sm:grid-cols-2"
          value={order.classId}
          onChange={(classId) => {
            const line = slate.lines.find((l) => l.classId === classId);
            if (line) setOrder({ ticker: line.ticker, classId });
          }}
          options={slate.lines
            .filter((l) => l.targetWeightPct > 0)
            .map((l) => ({
              id: l.classId,
              label: `${PRODUCTS[l.ticker].legalSeriesName} — ${PRODUCTS[l.ticker].className}`,
              hint: `${l.ticker} · ${l.seriesId} · ${l.classId} · ${l.sleeve}`,
            }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="ops-definition-card p-5">
          <h3 className="ops-body-strong text-[16px] text-white">Direction</h3>
          <ChoiceGroup
            label="Direction"
            className="mt-3 space-y-2"
            value={order.direction}
            onChange={(direction) => setOrder({ direction })}
            options={[
              { id: "buy" as const, label: "Buy" },
              { id: "sell" as const, label: "Sell" },
            ]}
          />
        </div>

        <div className="ops-definition-card p-5">
          <h3 className="ops-body-strong text-[16px] text-white">Order type</h3>
          <ChoiceGroup
            label="Order type"
            className="mt-3 space-y-2"
            value={order.orderType}
            onChange={(orderType) => setOrder({ orderType })}
            options={[
              {
                id: "market" as const,
                label: "Market",
                hint: "Controls timing, not price.",
              },
              {
                id: "limit" as const,
                label: "Limit",
                hint: "Controls price, not whether it fills.",
              },
            ]}
          />
        </div>

        <div className="ops-definition-card col-span-2 p-5 sm:col-span-1">
          <h3 className="ops-body-strong text-[16px] text-white">Amount</h3>
          <label className="mt-3 block">
            <span className="ops-caption block text-[12px] text-slate-400">
              Approximate US dollars
            </span>
            <input
              type="number"
              min={0}
              step={100}
              value={order.approxAmountUsd || ""}
              onChange={(e) =>
                setOrder({ approxAmountUsd: Number(e.target.value) || 0 })
              }
              className="mt-1.5 min-h-11 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[15px] tabular-nums text-white placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
            />
          </label>
          <p className="mt-2 text-[13px] leading-6 text-slate-400">
            Approximate on purpose — you cannot know the fill price in advance.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={!ready}
        onClick={onComplete}
        className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
      >
        {ready ? "Continue to save" : "Name the product, direction, type and amount"}
      </button>
    </div>
  );
}

function StageSave({
  slate,
  frictionOneWay,
  saved,
  blockers,
  onSave,
}: {
  slate: HoldingsSlate;
  frictionOneWay: number;
  saved: boolean;
  blockers: string[];
  onSave: () => void;
}) {
  const order = slate.orderDraft;
  const chosen = order.classId
    ? Object.values(PRODUCTS).find((p) => p.classId === order.classId)
    : undefined;
  const ready = isHoldingsSlateComplete({ ...slate, updatedAt: "x" });
  const frictionCost = (order.approxAmountUsd * frictionOneWay) / 100;

  return (
    <div className="space-y-4">
      <div className="ops-definition-card p-5">
        <h3 className="ops-body-strong text-[16px] text-white">Draft order</h3>
        <dl className="mt-3">
          <Row term="Security">
            {chosen
              ? `${chosen.legalSeriesName} — ${chosen.className}`
              : "Not chosen yet"}
          </Row>
          <Row term="Exact identity">
            {chosen ? (
              <span className="tabular-nums">
                CIK {chosen.cik} · {chosen.seriesId} · {chosen.classId} ·{" "}
                {chosen.ticker}
              </span>
            ) : (
              "—"
            )}
          </Row>
          <Row term="Order">
            {order.direction || "—"} · {order.orderType || "—"} ·{" "}
            {order.approxAmountUsd > 0 ? (
              <span className="tabular-nums">
                ${order.approxAmountUsd.toLocaleString("en-US")}
              </span>
            ) : (
              "—"
            )}
          </Row>
          <Row term="Estimated friction">
            <span className="tabular-nums">{frictionOneWay.toFixed(2)}%</span> one
            way, about{" "}
            <span className="tabular-nums">${frictionCost.toFixed(2)}</span> on this
            amount — from your Mission 8 budget
          </Row>
          <Row term="Transmission">
            <span className="ops-body-strong text-white">
              Nothing is transmitted.
            </span>{" "}
            No submit control, no order endpoint — nothing here to switch off.
          </Row>
        </dl>

        <details className="group mt-3 border-t border-white/8 pt-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-semibold text-slate-300">
            <span>Warnings attached to this draft</span>
            <span className="text-[13px] font-normal text-slate-400 group-open:hidden">
              Price uncertainty, account context
            </span>
            <span className="hidden text-[13px] font-normal text-slate-400 group-open:inline">
              Hide
            </span>
          </summary>
          <dl className="mt-2">
            <Row term="Price uncertainty">
              Market hours only. The price you get is not the price you see now, and
              an ETF can trade at a premium or a discount to net asset value.
            </Row>
            <Row term="Account context">
              Distributions may be taxable in a taxable account. This is a
              directional warning; nothing here calculates your tax.
            </Row>
          </dl>
        </details>
      </div>

      {blockers.length > 0 ? (
        <div className="ops-definition-card p-5">
          <h3 className="ops-body-strong text-[16px] text-white">
            Before this slate counts as verified
          </h3>
          <ul className="mt-2 space-y-1 text-[15px] leading-7 text-slate-300">
            {blockers.map((b) => (
              <li key={b}>· {b}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-[13px] leading-6 text-slate-400">
        Saved in this browser. Educational material, not investment advice. Every
        figure came from a filing retrieved on {RETRIEVED_AT}; none of it is live.
      </p>

      <button
        type="button"
        disabled={saved || !ready}
        onClick={onSave}
        className="min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
      >
        {saved ? "Holdings Slate saved ✓" : "Save the Holdings Slate"}
      </button>
      {!saved && !ready ? (
        <p className="text-[14px] leading-6 text-slate-400">
          An order that does not say which share class it is buying has not
          identified anything — the mistake this mission exists to prevent.
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function HoldingsJourney() {
  const {
    frictionBudget,
    architectureDecision,
    timingPolicy,
    holdingsSlate,
    saveHoldingsSlate,
  } = useIFProgress();

  const [picks, setPicks] = useState<Record<string, string>>({});
  // Instrument is a real default, not a placeholder. It used to start empty
  // while the table and the radio still showed instrument as selected, so the
  // stage rendered aria-checked="true" beside a disabled button reading
  // "Choose a key to continue" — a selection the interface claimed and denied
  // at the same time, and a lie to a screen reader. The learner switches to
  // issuer to watch the answer change; that is the lesson, not a gate.
  const [keyMode, setKeyMode] = useState<IssuerKeyMode>("instrument");
  const [repaired, setRepaired] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // The rehearsal opens with a plausible amount rather than a blank field: the
  // learning is in naming the share class and the order type, not in inventing a
  // number, and an empty required field is the kind of friction that makes a
  // learner abandon the last stage.
  const [slate, setSlate] = useState<HoldingsSlate>({
    ...EMPTY_HOLDINGS_SLATE,
    orderDraft: { ...EMPTY_ORDER_DRAFT, approxAmountUsd: 2500 },
  });
  const [saved, setSaved] = useState(false);

  /**
   * The learner's own friction, not a stand-in. Mission 8 saves an estimated
   * annual drag; a round trip is two legs, so one leg is half of it in
   * percentage points. Falls back to a labelled 0.5% only when Mission 8 has not
   * been done yet. Shared with Mission 11 so the two lessons cannot disagree.
   */
  const frictionOneWay = useMemo(
    () => frictionOneWayPct(frictionBudget),
    [frictionBudget],
  );

  // The slate the learner repaired in stage 3 is the slate they rehearse
  // against in stage 5. Built here rather than in the stage so the two cannot
  // drift apart.
  const workingSlate = useMemo<HoldingsSlate>(() => {
    const lines = [
      { ticker: "VTI", sleeve: "growth", targetWeightPct: 60 },
      { ticker: repaired ? "AGG" : "VOO", sleeve: repaired ? "stability" : "growth", targetWeightPct: 40 },
    ].map((l) => ({
      ticker: l.ticker,
      seriesId: PRODUCTS[l.ticker].seriesId,
      classId: PRODUCTS[l.ticker].classId,
      sleeve: l.sleeve,
      targetWeightPct: l.targetWeightPct,
    }));
    return {
      ...slate,
      lines,
      issuerKeyMode: keyMode,
      overlapAcknowledged: repaired,
      staleDataAcknowledged: Boolean(answers.stale),
      orderDraft: { ...slate.orderDraft, estimatedFrictionPct: frictionOneWay },
    };
  }, [slate, keyMode, repaired, answers.stale, frictionOneWay]);

  const blockers = useMemo(() => {
    const out: string[] = [];
    if (!architectureDecision?.updatedAt) {
      out.push("Mission 10's architecture licence has not been saved yet.");
    }
    if (!timingPolicy?.updatedAt) {
      out.push(
        "Mission 11's timing policy is missing. Choosing no timing counts, but it has to be written down.",
      );
    }
    return out;
  }, [architectureDecision, timingPolicy]);

  const restored = Boolean(holdingsSlate?.updatedAt) || saved;

  const renderStage = (stage: number, onComplete: () => void) => {
    if (stage === 0) return <StageIdentity onComplete={onComplete} />;
    if (stage === 1) return <StagePassport onComplete={onComplete} />;
    if (stage === 2)
      return (
        <StageLens picks={picks} setPicks={setPicks} onComplete={onComplete} />
      );
    if (stage === 3)
      return (
        <StageLookThrough
          keyMode={keyMode}
          setKeyMode={setKeyMode}
          onComplete={onComplete}
        />
      );
    if (stage === 4)
      return (
        <StageRepair
          keyMode={keyMode}
          repaired={repaired}
          setRepaired={setRepaired}
          onComplete={onComplete}
        />
      );
    if (stage === 5)
      return (
        <StageChecks
          answers={answers}
          setAnswers={setAnswers}
          onComplete={onComplete}
        />
      );
    if (stage === 6)
      return (
        <StageOrder
          slate={workingSlate}
          setSlate={setSlate}
          onComplete={onComplete}
        />
      );
    return (
      <StageSave
        slate={workingSlate}
        frictionOneWay={frictionOneWay}
        saved={saved || Boolean(holdingsSlate?.updatedAt)}
        blockers={blockers}
        onSave={() => {
          saveHoldingsSlate(workingSlate);
          setSaved(true);
        }}
      />
    );
  };

  return (
    <ValuationJourneyShell
      key={restored ? holdingsSlate?.updatedAt || "saved" : "fresh"}
      // Saving stamps updatedAt, which changes the key and remounts the shell.
      // A saved slate is the terminal state, so restore the learner there rather
      // than dropping them back on stage 1 with their work apparently gone.
      initialCompleted={restored ? STAGES.map(() => true) : undefined}
      initialStage={restored ? STAGES.length - 1 : undefined}
      lessonSlug={LESSON_SLUG}
      ariaLabel="Choose the actual holdings"
      labLabel="Guided holdings lab"
      savedArtifactLabel="Holdings Slate"
      stages={STAGES}
      renderStage={renderStage}
    />
  );
}
