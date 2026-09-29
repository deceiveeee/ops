"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STUDIO_CATALOG, type StudioInstrument } from "@/lib/studio-catalog";
import {
  accruedPer100,
  isDue,
  paymentFor,
  periodFor,
  remainingCashFlows,
  yieldFromPrice,
  type BondTerms,
} from "@/lib/studio-project/bond-cash-flows";
import { setAccruedInterest } from "@/lib/studio-project/operations";
import { cn } from "@/lib/utils";
import { Choice, Field, STAGE_TAB, STAGE_TABS, Stat, StageHeading, usd } from "./shared";
import ViewTabs from "./workspace/ViewTabs";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/**
 * A bond on the day you settle: what it costs, and what it pays afterwards.
 *
 * The buying worksheet has always been able to hold accrued interest but never
 * able to work one out, because the figure depends on the day the buyer
 * settles. The catalog's Treasury note therefore carried `null` and the
 * worksheet said, correctly, that its total was incomplete. This is where the
 * figure comes from, and it comes from the issuer's own rule rather than a
 * textbook's: `lib/studio-project/bond-cash-flows.ts` and the method file's §2.
 *
 * Three things a learner should leave with. A bond quote is not what you pay:
 * the interest built up since the last payment is added to it, and it goes to
 * the seller. The day count is a rule, not an opinion — 181 to 184 actual days
 * in a half-year. And a bond bought part-way through a period still pays a full
 * coupon at the end of it, which is exactly why the buyer compensates the
 * seller up front.
 */

const link = "text-accent-cyan underline underline-offset-2 hover:text-white";
const button =
  "inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-4 text-[14px] font-semibold text-white transition-colors hover:border-accent-cyan/70 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40";

/** "15 August 2036", from 2036-08-15. */
function longDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

const money = (value: number) => usd(value);
/** "$100" rather than "$100.00", where the cents are always zero. */
const dollars = (value: number) => usd(value).replace(/\.00$/, "");
const per100 = (value: number) => value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");

const BONDS = STUDIO_CATALOG.filter((instrument): instrument is StudioInstrument & { bond: NonNullable<StudioInstrument["bond"]> } =>
  instrument.kind === "bond" && instrument.bond !== null,
);

export default function BondView() {
  const { session } = useWorkspace();
  const [instrumentId, setInstrumentId] = useState(BONDS[0]?.id ?? "");
  const instrument = BONDS.find((entry) => entry.id === instrumentId) ?? BONDS[0];
  // Today, in the learner's own clock, as a plain date. Read once so a render
  // at midnight cannot change the answer under them.
  const [settlement, setSettlement] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [face, setFace] = useState(String(instrument?.minimumUnits ? instrument.minimumUnits * 10 : 1000));
  const [quoted, setQuoted] = useState(String(instrument?.referencePrice ?? ""));
  const [fee, setFee] = useState("0");
  const [saved, setSaved] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [view, setView] = useState<BondTab>("pay");

  const terms: BondTerms | null = useMemo(
    () =>
      instrument
        ? { couponPct: instrument.bond.couponPct, datedDate: instrument.bond.datedDate, maturity: instrument.bond.maturity }
        : null,
    [instrument],
  );

  const faceValue = Number(face.replace(/[^0-9.]/g, "")) || 0;
  const quotedValue = Number(quoted.replace(/[^0-9.]/g, "")) || 0;
  const feeValue = Number(fee.replace(/[^0-9.]/g, "")) || 0;

  const worked = useMemo(() => {
    if (!terms) return null;
    const period = periodFor(terms, settlement);
    if (!isDue(period)) return { reason: period.reason };
    const accrued = accruedPer100(terms, settlement);
    if (!isDue(accrued)) return { reason: accrued.reason };
    const flows = remainingCashFlows(terms, settlement, faceValue || 0);
    const payment = paymentFor({ face: faceValue, quotedPer100: quotedValue, accruedPer100: accrued, fee: feeValue });
    const rate = yieldFromPrice(terms, settlement, quotedValue);
    return {
      period,
      accrued,
      flows: isDue(flows) ? flows : [],
      payment: isDue(payment) ? payment : null,
      paymentProblem: isDue(payment) ? null : payment.reason,
      rate: isDue(rate) ? rate : null,
    };
  }, [terms, settlement, faceValue, quotedValue, feeValue]);

  const project = session.status === "ready" ? session.project : null;
  const held = Boolean(
    project?.alternatives.some((alternative) => alternative.positions.some((position) => position.instrumentId === instrumentId)),
  );

  const carry = async () => {
    setProblem(null);
    setSaved(null);
    if (!worked || "reason" in worked) return;
    const result = await session.update((current) => setAccruedInterest(current, instrumentId, worked.accrued));
    if (!result.ok) {
      setProblem(`Not saved — ${result.error}`);
      return;
    }
    setSaved(`Saved for What to buy, beside the price there: ${per100(worked.accrued)} per $100, as at ${settlement}.`);
  };

  if (!instrument || !terms) {
    return (
      <div className="space-y-4">
        <StageHeading as="h1" title="A bond, day by day">Studio holds no individual bond yet.</StageHeading>
      </div>
    );
  }

  const rest = worked && !("reason" in worked) ? worked : null;
  const total = rest?.flows.reduce((sum, flow) => sum + flow.amount, 0) ?? 0;
  const next = rest?.flows[0];
  const last = rest?.flows[rest.flows.length - 1];

  return (
    <div className="space-y-4">
      {/*
        * The page's one idea, before the numbers that show it. It was said
        * twice, under the title and again in a "What to look for" box, and the
        * two together took a sixth of a phone screen. With one bond there is no
        * choice to name it, so its name heads the page; its terms are with what
        * it pays.
        */}
      <StageHeading as="h1" eyebrow={BONDS.length > 1 ? undefined : instrument.name} title="What this bond costs on the day you settle">
        A quoted price covers the loan only. The interest built up since the last payment is added on top.
      </StageHeading>

      <section aria-labelledby="bond-settlement" className="space-y-3">
        <h2 id="bond-settlement" className="sr-only">
          This issue, and what you would buy
        </h2>
        {/* Two to a row even on a phone: one to a row, four short entries took most of the screen. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {BONDS.length > 1 ? (
            <Choice
              label="Which bond"
              value={instrumentId}
              options={BONDS.map((entry) => ({ value: entry.id, label: entry.name }))}
              onChange={setInstrumentId}
            />
          ) : null}
          <Field label="The day you settle" type="text" placeholder="2026-09-15" value={settlement} onChange={setSettlement} />
          <Field
            label="Face value you would buy"
            hint={`In ${dollars(instrument.quantityStep)} steps, from ${dollars(instrument.minimumUnits)}`}
            type="number"
            min={0}
            prefix="$"
            value={face}
            onChange={setFace}
          />
          <Field
            label="Price per $100 of face value"
            hint={instrument.priceAsOf ? `${instrument.referencePrice ?? ""} on ${instrument.priceAsOf}` : undefined}
            type="number"
            min={0}
            value={quoted}
            onChange={setQuoted}
          />
          <Field label="Fee your broker charges" type="number" min={0} prefix="$" value={fee} onChange={setFee} />
        </div>
      </section>

      {worked && "reason" in worked ? (
        <p role="alert" className="text-[14px] leading-6 text-accent-amber">
          {worked.reason}
        </p>
      ) : rest ? (
        <>
          {/*
            * What leaves the account on the day, and what comes back afterwards,
            * one at a time. Together they made this page 2.6 screens on a phone.
            * The entries above serve both.
            */}
          <ViewTabs label="This bond" idPrefix="bond" className={STAGE_TABS} tabs={BOND_TABS} selected={view} onSelect={setView} />
          <div role="tabpanel" id="bond-panel" aria-labelledby={`bond-tab-${view}`} className="space-y-3">
          {view === "pay" ? (
          <>
          {/* In the order they add up: the loan, the interest on top, what leaves the account. */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              label="The loan itself"
              value={rest.payment ? money(rest.payment.principal) : "—"}
              detail={`${quotedValue || "—"} per $100 of face value`}
            />
            <Stat
              label="Interest built up"
              value={rest.payment ? money(rest.payment.accrued) : `${per100(rest.accrued)} per $100`}
              detail={`${rest.period.accruedDays} of ${rest.period.days} days since ${longDate(rest.period.start)}`}
            />
            <Stat
              label="What leaves the account"
              value={rest.payment ? money(rest.payment.total) : "—"}
              detail={rest.payment ? `Price, interest${rest.payment.fee ? " and fee" : ""}, together` : rest.paymentProblem ?? ""}
            />
            <Stat
              label="Yield at this price"
              value={rest.rate === null ? "—" : `${rest.rate.toFixed(3)}%`}
              detail="What the remaining payments return if held to the end"
            />
          </div>
          <p className="text-[13px] leading-5 text-slate-400">
            The next payment, on {next ? longDate(next.date) : "—"}, is a whole six months of interest however long you have
            held it — which is why the {rest.payment ? money(rest.payment.accrued) : "interest built up"} goes to the seller
            now.
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <button type="button" onClick={() => void carry()} disabled={!held} className={button}>
              Use this interest figure in What to buy
            </button>
            {/*
              * What the button does, then what it did, in the one line: a saved
              * message below the note took a phone past a screen and a half. The
              * link to What to buy comes with the save, when there is something
              * there to see.
              */}
            <p role="status" className={cn("text-[13px] leading-5", saved ? "text-accent-green" : "text-slate-500")}>
              {saved ? (
                <>
                  {saved}{" "}
                  <Link href="/studio/portfolio/buying" className={link}>
                    Open What to buy
                  </Link>
                </>
              ) : held ? (
                "It goes beside the price there, never inside it."
              ) : (
                <>
                  Add this bond to your plan first, in{" "}
                  <Link href="/studio/portfolio" className={link}>
                    Portfolio
                  </Link>
                  .
                </>
              )}
            </p>
          </div>

          {problem ? (
            <p role="alert" className="text-[13px] leading-6 text-accent-amber">
              {problem}
            </p>
          ) : null}

          {/* One tap away rather than always open: on a phone it was a ninth of the screen under the work. */}
          <details>
            {/* Padded rather than made flex, which would drop the disclosure's arrow. */}
            <summary className="cursor-pointer text-[12px] text-slate-500 [@media(pointer:coarse)]:py-[13px]">
              Where these figures come from
            </summary>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">
              Day count and price: the issuer&rsquo;s own rule, 31 CFR part 356, appendix B — a half-year is its actual 181 to
              184 days, and the part-period is discounted with simple interest. A broker may settle on a different day and add
              its own charge, so confirm the figure with them.
            </p>
          </details>
          </>
          ) : (
          <>
          <p className="text-[14px] leading-6 text-slate-300">
            Interest of {instrument.bond.couponPct}% a year on the face value, paid twice a year, from{" "}
            {longDate(terms.datedDate)} to {longDate(terms.maturity)}, when the face value comes back.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Payments left" value={String(rest.flows.length)} detail={next ? `Next on ${longDate(next.date)}` : ""} />
            <Stat label="Each payment" value={next ? money(next.amount) : "—"} detail="Twice a year" />
            <Stat
              label="Last payment"
              value={last ? money(last.amount) : "—"}
              detail={last ? `${longDate(last.date)}, with the face value` : ""}
            />
            <Stat label="Everything still to come" value={money(total)} detail="Interest and face value together" />
          </div>
          </>
          )}
          </div>
        </>
      ) : null}
    </div>
  );
}

type BondTab = "pay" | "back";
const BOND_TABS: { id: BondTab; label: string; className: string }[] = [
  { id: "pay", label: "What you pay", className: STAGE_TAB },
  { id: "back", label: "What it pays you", className: STAGE_TAB },
];
