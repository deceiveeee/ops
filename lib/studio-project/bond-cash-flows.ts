/**
 * What a Treasury note actually costs on the day you settle, and what it pays
 * afterwards.
 *
 * Studio has had a bond engine since the fixed-income lessons — cash flows,
 * price from yield, duration — but no day count and no accrued interest, so
 * every bond total in the buying worksheet was short by an unstated amount and
 * said so (`docs/source-audits/studio-catalog.md` §1). This fills that in, and
 * it does it the way the issuer does rather than the way a textbook does.
 *
 * **The rule is the Treasury's own.** 31 CFR part 356, appendix B (retrieved
 * 2026-09-15 from eCFR) states both halves of it:
 *
 * - A semiannual payment is half the annual interest "regardless of the actual
 *   number of days in the half-year", and a buyer settling part-way through a
 *   period pays the seller a daily share of it, the day count being "the actual
 *   number of calendar days in the half-year" — 181, 182, 183 or 184 days. That
 *   is accrued interest, and it is the actual/actual convention.
 * - The price of a non-indexed security with a regular first payment period is
 *   the solution of `P[1 + (r/s)(i/2)] = (C/2)(r/s) + (C/2)aₙ + 100vₙ`, where r
 *   is the days from settlement to the next payment and s the days in that
 *   period. Note what that says: the part-period is discounted with **simple**
 *   interest, not compounded. A textbook's `v^(r/s)` gives a different number.
 *
 * Both halves are checked against Treasury's own published figures for the note
 * in Studio's catalog, CUSIP 91282CRF0, at two settlement dates — see
 * `bond-cash-flows.test.ts` and `studio-quantitative-methods.md` §2.
 *
 * **What this does not do.** Semiannual Treasury notes and bonds with a regular
 * first period only. A short or long first period, a floating rate, an
 * inflation-indexed security and a corporate 30/360 convention each have their
 * own rule, and each would need its own source and its own checks; asking for
 * one here returns a refusal rather than the wrong arithmetic. Nothing here
 * touches the network.
 */

/** A dated, fixed-rate, semiannual issue. Dates are YYYY-MM-DD. */
export interface BondTerms {
  /** Annual rate on face value, as a percentage: 4.625 for 4.625%. */
  couponPct: number;
  /** When interest starts to accrue. Not always the issue date: this note is dated two days earlier. */
  datedDate: string;
  maturity: string;
}

/** Why a settlement date cannot be worked out. */
export interface NotDue {
  reason: string;
}
export const isDue = <T>(outcome: T | NotDue): outcome is T =>
  typeof outcome !== "object" || outcome === null || !("reason" in outcome);

const DAY = 86_400_000;
const utc = (date: string) => Date.parse(`${date}T00:00:00Z`);
const valid = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(utc(date));

/** Whole calendar days between two dates, as the day count needs them. */
export function daysBetween(from: string, to: string): number {
  return Math.round((utc(to) - utc(from)) / DAY);
}

const iso = (time: number) => new Date(time).toISOString().slice(0, 10);

/**
 * Six months earlier, keeping the day of the month where the month is long
 * enough and taking the last day where it is not — 31 August back to 28 or 29
 * February.
 */
export function monthsBefore(date: string, months: number): string {
  const when = new Date(utc(date));
  const day = when.getUTCDate();
  const target = new Date(Date.UTC(when.getUTCFullYear(), when.getUTCMonth() - months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return iso(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay)));
}

/**
 * Every interest payment date, oldest first, counted back from maturity.
 *
 * Back from maturity rather than forward from the dated date, because the
 * maturity date is what sets an issue's two payment dates each year: a note
 * maturing on 15 August pays on 15 February and 15 August.
 */
export function couponDates(terms: BondTerms): string[] {
  if (!valid(terms.datedDate) || !valid(terms.maturity) || utc(terms.maturity) <= utc(terms.datedDate)) return [];
  const dates: string[] = [];
  let date = terms.maturity;
  // A ten-year note has twenty payments; the cap is a guard, not a limit anyone reaches.
  for (let step = 0; step < 200 && utc(date) > utc(terms.datedDate); step += 1) {
    dates.unshift(date);
    date = monthsBefore(terms.maturity, 6 * (step + 1));
  }
  return dates;
}

export interface CouponPeriod {
  /** The payment date the period runs from, or the dated date for the first one. */
  start: string;
  /** The payment date it runs to: the next interest payment. */
  end: string;
  /** Days in the whole period: 181, 182, 183 or 184. */
  days: number;
  /** Days from the start to settlement, which is what interest has built up over. */
  accruedDays: number;
  /** Days from settlement to the next payment. */
  remainingDays: number;
  /** Payments still to come, the one ending this period included. */
  paymentsLeft: number;
}

/**
 * The interest period a settlement date falls in.
 *
 * Settling on a payment date starts the next period: the buyer is not entitled
 * to that day's payment, so nothing has accrued and the next payment is six
 * months away.
 */
export function periodFor(terms: BondTerms, settlement: string): CouponPeriod | NotDue {
  if (!valid(settlement)) return { reason: "That is not a date Studio can read." };
  const dates = couponDates(terms);
  if (!dates.length) return { reason: "This issue's dates do not make a schedule Studio can read." };
  if (utc(settlement) < utc(terms.datedDate)) {
    return { reason: `Interest starts on ${terms.datedDate}, so there is nothing to settle before then.` };
  }
  if (utc(settlement) >= utc(terms.maturity)) {
    return { reason: `This issue matures on ${terms.maturity}, so there is nothing left to buy on that date.` };
  }
  const endIndex = dates.findIndex((date) => utc(date) > utc(settlement));
  const end = dates[endIndex];
  const start = endIndex === 0 ? terms.datedDate : dates[endIndex - 1];
  return {
    start,
    end,
    days: daysBetween(start, end),
    accruedDays: daysBetween(start, settlement),
    remainingDays: daysBetween(settlement, end),
    paymentsLeft: dates.length - endIndex,
  };
}

/**
 * Interest built up since the last payment, per $100 of face value.
 *
 * Half the annual rate, shared out by actual days: `(C/2) × accrued days ÷ days
 * in the period`. Treasury's published figures for CUSIP 91282CRF0 are
 * 0.25136 and 3.89606 per $1,000 at its two settlement dates, and the tests hold
 * this to both.
 */
export function accruedPer100(terms: BondTerms, settlement: string): number | NotDue {
  const period = periodFor(terms, settlement);
  if (!isDue(period)) return period;
  return (terms.couponPct / 2) * (period.accruedDays / period.days);
}

export interface CashFlow {
  date: string;
  /** In dollars, for the face value asked for. */
  amount: number;
  kind: "interest" | "interest and face value";
}

/** Every payment still to come after a settlement date, for a face amount. */
export function remainingCashFlows(terms: BondTerms, settlement: string, face: number): CashFlow[] | NotDue {
  const period = periodFor(terms, settlement);
  if (!isDue(period)) return period;
  if (!(face > 0)) return { reason: "Enter the face value you would buy." };
  const dates = couponDates(terms);
  const coupon = (face * terms.couponPct) / 200;
  return dates
    .filter((date) => utc(date) > utc(settlement))
    .map((date, index, all) => ({
      date,
      amount: index === all.length - 1 ? coupon + face : coupon,
      kind: index === all.length - 1 ? ("interest and face value" as const) : ("interest" as const),
    }));
}

/**
 * The quoted price per $100 that a yield implies, by Treasury's own formula:
 *
 *     P[1 + (r/s)(i/2)] = (C/2)(r/s) + (C/2)aₙ + 100vₙ
 *
 * The part-period is discounted with simple interest, which is the issuer's
 * convention and not the compounding a textbook uses. `n` is the number of full
 * periods after the part-period, so settling on a payment date leaves one
 * fewer, exactly as appendix B says.
 */
export function priceFromYield(terms: BondTerms, settlement: string, yieldPct: number): number | NotDue {
  const period = periodFor(terms, settlement);
  if (!isDue(period)) return period;
  if (!Number.isFinite(yieldPct) || yieldPct <= -100) return { reason: "Enter a yield as a percentage, such as 4.5." };
  const fraction = period.remainingDays / period.days;
  const rate = yieldPct / 100 / 2;
  const coupon = terms.couponPct / 2;
  const n = period.paymentsLeft - 1;
  // At a yield of zero every pound comes back undiscounted, and the usual
  // formula for the annuity divides by it, so it is summed instead.
  const discounted = rate === 0 ? 1 : Math.pow(1 + rate, -n);
  const annuity = rate === 0 ? n : (1 - discounted) / rate;
  const value = coupon * fraction + coupon * annuity + 100 * discounted;
  return value / (1 + fraction * rate);
}

/**
 * The yield a quoted price implies, found by halving the interval.
 *
 * Bisection rather than Newton's method for the same reason `fixed-income.ts`
 * uses it: it cannot run away from a bad starting point, and a wrong yield here
 * would be quietly wrong rather than obviously wrong.
 */
export function yieldFromPrice(terms: BondTerms, settlement: string, quotedPer100: number): number | NotDue {
  const period = periodFor(terms, settlement);
  if (!isDue(period)) return period;
  if (!(quotedPer100 > 0)) return { reason: "Enter the price per $100 of face value, such as 99.54." };
  let low = -50;
  let high = 200;
  for (let step = 0; step < 200; step += 1) {
    const middle = (low + high) / 2;
    const price = priceFromYield(terms, settlement, middle);
    if (!isDue(price)) return price;
    if (price > quotedPer100) low = middle;
    else high = middle;
  }
  const answer = (low + high) / 2;
  const check = priceFromYield(terms, settlement, answer);
  if (!isDue(check)) return check;
  if (Math.abs(check - quotedPer100) > 1e-6) {
    return { reason: "No yield produces that price for this issue; check the price and the settlement date." };
  }
  return answer;
}

/** Money to the cent, kept in cents so rounding cannot drift. */
const cents = (value: number) => Math.round(value * 100);

export interface Payment {
  /** Face value bought. */
  face: number;
  /** The quoted price times the face value: what the loan itself costs. */
  principal: number;
  /** Interest built up since the last payment, paid to the seller. */
  accrued: number;
  fee: number;
  /** Principal, accrued interest and fee together. */
  total: number;
}

/**
 * What leaves the account. The quote covers the principal only, so accrued
 * interest is added once, beside it, rather than folded into the price — which
 * is what stops a worksheet counting it twice.
 */
export function paymentFor({
  face,
  quotedPer100,
  accruedPer100: accrued,
  fee = 0,
}: {
  face: number;
  quotedPer100: number;
  accruedPer100: number;
  fee?: number;
}): Payment | NotDue {
  if (!(face > 0)) return { reason: "Enter the face value you would buy." };
  if (!(quotedPer100 > 0)) return { reason: "Enter the price per $100 of face value." };
  if (!(accrued >= 0)) return { reason: "Accrued interest cannot be negative." };
  if (!(fee >= 0)) return { reason: "A fee cannot be negative." };
  const principalCents = cents((face * quotedPer100) / 100);
  const accruedCents = cents((face * accrued) / 100);
  const feeCents = cents(fee);
  return {
    face,
    principal: principalCents / 100,
    accrued: accruedCents / 100,
    fee: feeCents / 100,
    total: (principalCents + accruedCents + feeCents) / 100,
  };
}

/**
 * The largest face value a budget covers, in the increments the issue trades
 * in, with the accrued interest and the fee inside the budget rather than on
 * top of it.
 */
export function faceWithin({
  budget,
  quotedPer100,
  accruedPer100: accrued,
  fee = 0,
  step,
  minimum,
}: {
  budget: number;
  quotedPer100: number;
  accruedPer100: number;
  fee?: number;
  step: number;
  minimum: number;
}): { face: number; payment: Payment | null; leftover: number } {
  const perUnit = (quotedPer100 + accrued) / 100;
  const spendable = Math.max(0, budget - fee);
  if (!(perUnit > 0) || !(step > 0) || !(minimum > 0)) return { face: 0, payment: null, leftover: budget };
  let units = Math.floor(spendable / (perUnit * step) + 1e-9);
  let face = units * step;
  let payment = face >= minimum ? paymentFor({ face, quotedPer100, accruedPer100: accrued, fee }) : null;
  // Rounding each part to the cent must never push the total past the budget.
  while (units > 0 && payment && isDue(payment) && cents(payment.total) > cents(budget)) {
    units -= 1;
    face = units * step;
    payment = face >= minimum ? paymentFor({ face, quotedPer100, accruedPer100: accrued, fee }) : null;
  }
  if (face < minimum || !payment || !isDue(payment)) return { face: 0, payment: null, leftover: budget };
  return { face, payment, leftover: (cents(budget) - cents(payment.total)) / 100 };
}
