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
import { Choice, Field, Panel, Stat, StageHeading, usd } from "./shared";
import StudioAside from "./workspace/StudioAside";
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

const LOOK_FOR =
  "What actually leaves your account on the day you settle, and what comes back afterwards. A bond's quoted price covers the loan only: the interest built up since the last payment is added to it, and it goes to whoever held the bond through those days.";

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
    setSaved(`Saved for What to buy: ${per100(worked.accrued)} per $100, as at ${settlement}.`);
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
      <StageHeading as="h1" title="What this bond costs on the day you settle">
        A quote covers the loan itself. The interest built up since the last payment is added to it, and the day count that
        works it out is the issuer&rsquo;s own rule.
      </StageHeading>

      <section aria-labelledby="bond-settlement" className="space-y-3">
        <h2 id="bond-settlement" className="sr-only">
          This issue, and what you would buy
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            hint={`In ${money(instrument.quantityStep)} steps, from ${money(instrument.minimumUnits)}`}
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

        <p className="text-[13px] leading-5 text-slate-400">
          {instrument.name}. Interest of {instrument.bond.couponPct}% a year on the face value, paid twice a year, from{" "}
          {longDate(terms.datedDate)} to {longDate(terms.maturity)}, when the face value comes back.
        </p>
      </section>

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

      {worked && "reason" in worked ? (
        <p role="alert" className="text-[14px] leading-6 text-accent-amber">
          {worked.reason}
        </p>
      ) : rest ? (
        <>
          <section aria-labelledby="bond-cost" className="space-y-3">
            <h3 id="bond-cost" className="text-[15px] font-semibold text-white">
              On {longDate(settlement)}
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat
                label="Interest built up"
                value={rest.payment ? money(rest.payment.accrued) : `${per100(rest.accrued)} per $100`}
                detail={`${rest.period.accruedDays} of ${rest.period.days} days since ${longDate(rest.period.start)}`}
              />
              <Stat
                label="The loan itself"
                value={rest.payment ? money(rest.payment.principal) : "—"}
                detail={`${quotedValue || "—"} per $100 of face value`}
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
          </section>

          <section aria-labelledby="bond-payments" className="space-y-2">
            <h3 id="bond-payments" className="text-[15px] font-semibold text-white">
              What it pays you afterwards
            </h3>
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
          </section>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <button type="button" onClick={() => void carry()} disabled={!held} className={button}>
              Use this interest figure in What to buy
            </button>
            <p className="text-[13px] leading-5 text-slate-500">
              {held ? (
                <>
                  It is added beside the price there, never inside it.{" "}
                  <Link href="/studio/portfolio/buying" className={link}>
                    Open What to buy
                  </Link>
                </>
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

          {saved ? (
            <p role="status" className="text-[13px] leading-6 text-accent-green">
              {saved}
            </p>
          ) : null}
          {problem ? (
            <p role="alert" className="text-[13px] leading-6 text-accent-amber">
              {problem}
            </p>
          ) : null}

          <p className="text-[12px] leading-5 text-slate-500">
            Day count and price: the issuer&rsquo;s own rule, 31 CFR part 356, appendix B — a half-year is its actual 181 to 184
            days, and the part-period is discounted with simple interest. A broker may settle on a different day and add its own
            charge, so confirm the figure with them.
          </p>
        </>
      ) : null}
    </div>
  );
}
