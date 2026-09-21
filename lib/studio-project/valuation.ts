/**
 * What a business is worth if it keeps earning what it earns and grows by
 * buying that growth — and what the price someone is asking would require.
 *
 * **The model is the one Studio already teaches, and nothing more.** Session 5
 * of the Damodaran course, audited in
 * `docs/source-audits/damodaran-session-5-valuation-basics.md`, gives three
 * things and this file implements exactly those three:
 *
 * - Firm cash flow is after taxes and reinvestment and before debt payments.
 * - **Growth has to be bought**: the reinvestment rate is the growth rate
 *   divided by the return on capital.
 * - Growth is therefore neutral when that return equals the cost of capital,
 *   adds value above it and destroys value below it.
 *
 * So the value of the firm is `NOPAT × (1 − g/ROC) ÷ (cost of capital − g)`, a
 * business growing steadily for ever. A multi-stage forecast with its own
 * terminal value is **not** here: that audit marks terminal-value mechanics as
 * a deferred topic, and building one would mean putting a model on the screen
 * that no reviewed source in this project supports yet.
 *
 * **What this is for, and what it is not for.** It is for asking what a price
 * assumes. A learner enters what someone is asking for a share, and the reverse
 * question — what growth would justify it — is answerable in closed form and is
 * the honest use of a model this rough. A single confident value per share is
 * not the point, and the surface built on this shows a grid of assumptions
 * rather than one number.
 *
 * Nothing here touches the network, and every refusal carries its reason.
 */

/** Why a value cannot be worked out. */
export interface Unpriceable {
  reason: string;
}
export const isValued = <T>(outcome: T | Unpriceable): outcome is T =>
  typeof outcome !== "object" || outcome === null || !("reason" in outcome);

export interface GrowthInputs {
  /** Operating profit after tax for the year just filed, in the filing's own units. */
  nopat: number;
  /** What each new dollar put into the business earns, as a fraction: 0.12 for 12%. */
  returnOnNewCapital: number;
  /** What money costs this business, as a fraction. */
  costOfCapital: number;
  /** How fast profit grows from here, for ever, as a fraction. */
  growth: number;
}

export interface FirmValue {
  /** The share of profit that has to go back in to buy that growth: g ÷ ROC. */
  reinvestmentRate: number;
  /** What is left over for everyone who financed the business. */
  cashFlow: number;
  /** The whole business, lenders and shareholders together. */
  value: number;
  /** What growth is doing at these returns, which is the point of the exercise. */
  growthEffect: "adds" | "removes" | "neither";
}

/**
 * The whole business, at one growth rate bought at one return on capital.
 *
 * Every refusal here is a case where the arithmetic would produce a number that
 * means nothing: a growth rate at or above the cost of capital divides by zero
 * or goes negative, a company that earns nothing on new money cannot buy
 * growth, and a loss-making year has no profit to grow.
 */
export function firmValue({ nopat, returnOnNewCapital, costOfCapital, growth }: GrowthInputs): FirmValue | Unpriceable {
  if (!Number.isFinite(nopat) || nopat <= 0) {
    return { reason: "This needs a year with an operating profit: there is nothing here to grow." };
  }
  if (!Number.isFinite(costOfCapital) || costOfCapital <= 0) {
    return { reason: "The cost of capital has to be above zero for a value to mean anything." };
  }
  if (!Number.isFinite(returnOnNewCapital) || returnOnNewCapital <= 0) {
    return { reason: "Growth has to be bought, so this needs a return on new money above zero." };
  }
  if (!Number.isFinite(growth) || growth < 0) {
    return { reason: "This model grows a business or holds it still; it cannot shrink one." };
  }
  if (growth >= costOfCapital) {
    return {
      reason:
        "Nothing grows at or above its cost of capital for ever — the arithmetic gives an unbounded value — so try a growth rate below it.",
    };
  }

  const reinvestmentRate = growth / returnOnNewCapital;
  const cashFlow = nopat * (1 - reinvestmentRate);
  if (cashFlow <= 0) {
    return {
      reason:
        "At that growth the business has to put back more than it earns, so nothing reaches the people who financed it.",
    };
  }
  return {
    reinvestmentRate,
    cashFlow,
    value: cashFlow / (costOfCapital - growth),
    growthEffect:
      returnOnNewCapital > costOfCapital ? "adds" : returnOnNewCapital < costOfCapital ? "removes" : "neither",
  };
}

export interface EquityInputs {
  /** The whole business, from `firmValue`. */
  firmValue: number;
  /** Money owed to lenders, in the same units. */
  debt: number;
  /** Cash the business holds, in the same units. */
  cash: number;
  /** Shares in issue, as a count. */
  shares: number;
  /**
   * Company shares behind one traded receipt, where what trades is a depositary
   * share rather than the share itself. TSMC's is five.
   */
  sharesPerReceipt?: number | null;
}

export interface EquityValue {
  /** Debt less cash: what the lenders' claim comes to net. */
  netDebt: number;
  /** What is left for the shareholders once the lenders are paid. */
  equityValue: number;
  perShare: number;
  /** Per traded receipt, where one stands for several shares. Null where the shares trade directly. */
  perReceipt: number | null;
}

/**
 * From the whole business to one share.
 *
 * The bridge is the part a learner most often gets wrong, so it is explicit:
 * the model values the business, the lenders are paid out of it, the cash it
 * holds belongs to the owners, and only what is left is divided by the shares.
 */
export function equityFromFirm({ firmValue: whole, debt, cash, shares, sharesPerReceipt = null }: EquityInputs): EquityValue | Unpriceable {
  if (!Number.isFinite(whole) || whole <= 0) return { reason: "There is no value for the business to share out." };
  if (!Number.isFinite(shares) || shares <= 0) return { reason: "This needs the number of shares in issue." };
  if (![debt, cash].every((value) => Number.isFinite(value) && value >= 0)) {
    return { reason: "Borrowings and cash have to be figures, and neither can be negative." };
  }
  const netDebt = debt - cash;
  const equityValue = whole - netDebt;
  if (equityValue <= 0) {
    return {
      reason:
        "At these assumptions the lenders' claim is worth more than the whole business, so there is nothing left for the shares.",
    };
  }
  const perShare = equityValue / shares;
  return {
    netDebt,
    equityValue,
    perShare,
    perReceipt:
      sharesPerReceipt !== null && Number.isFinite(sharesPerReceipt) && sharesPerReceipt > 0 ? perShare * sharesPerReceipt : null,
  };
}

export interface PriceInputs {
  /** What someone is asking for one traded share or receipt. */
  price: number;
  shares: number;
  debt: number;
  cash: number;
  sharesPerReceipt?: number | null;
}

/** What the market is paying for the whole business, worked back from a share price. */
export function firmValueAtPrice({ price, shares, debt, cash, sharesPerReceipt = null }: PriceInputs): number | Unpriceable {
  if (!Number.isFinite(price) || price <= 0) return { reason: "Enter the price someone is asking for one share." };
  if (!Number.isFinite(shares) || shares <= 0) return { reason: "This needs the number of shares in issue." };
  const perShare = sharesPerReceipt !== null && Number.isFinite(sharesPerReceipt) && sharesPerReceipt > 0 ? price / sharesPerReceipt : price;
  return perShare * shares + debt - cash;
}

/** The same formula with no guard on the sign of growth, for checking a root. */
function valueAt(nopat: number, returnOnNewCapital: number, costOfCapital: number, growth: number): number | null {
  if (growth >= costOfCapital) return null;
  const cashFlow = nopat * (1 - growth / returnOnNewCapital);
  const value = cashFlow / (costOfCapital - growth);
  return cashFlow > 0 && value > 0 ? value : null;
}

/**
 * The growth a price is asking for — the reverse question, in closed form, and
 * then checked by putting the answer back into the model.
 *
 * Rearranging `EV = NOPAT(1 − g/ROC) ÷ (r − g)` gives
 * `g = (NOPAT − EV·r) ÷ (NOPAT/ROC − EV)`, but that rearrangement has a root
 * in a region the model itself refuses — a price of 900 for a business worth
 * 1,200 standing still comes back as 30% growth, which is not an answer, it is
 * an artefact. So the root is substituted back, and a root that does not
 * reproduce the price is reported as a price this model cannot explain, with
 * the reason it cannot: growth only adds value where new money earns more than
 * it costs, and changes nothing at all where it earns exactly that.
 *
 * A negative answer is kept, because it is a real one: it says the price is
 * below what the business is worth standing still, or — for a business that
 * destroys value by growing — above it.
 */
export function impliedGrowth({
  firmValue: paid,
  nopat,
  returnOnNewCapital,
  costOfCapital,
}: {
  firmValue: number;
  nopat: number;
  returnOnNewCapital: number;
  costOfCapital: number;
}): number | Unpriceable {
  if (!Number.isFinite(paid) || paid <= 0) return { reason: "That price does not put a value on the business." };
  if (!Number.isFinite(nopat) || nopat <= 0) return { reason: "This needs a year with an operating profit." };
  if (!Number.isFinite(returnOnNewCapital) || returnOnNewCapital <= 0) {
    return { reason: "This needs a return on new money above zero." };
  }
  if (!Number.isFinite(costOfCapital) || costOfCapital <= 0) return { reason: "This needs a cost of capital above zero." };

  const standingStill = nopat / costOfCapital;
  // Where new money earns exactly what it costs, growth changes nothing at all,
  // so every growth rate gives the same value and no price but that one has an answer.
  if (Math.abs(returnOnNewCapital - costOfCapital) < 1e-12) {
    return Math.abs(paid - standingStill) < 1e-6 * Math.max(1, standingStill)
      ? 0
      : {
          reason:
            "New money here earns exactly what it costs, so growth changes nothing and no growth rate explains a price away from what the business is worth standing still.",
        };
  }

  const denominator = nopat / returnOnNewCapital - paid;
  const growth = Math.abs(denominator) < 1e-12 ? Number.NaN : (nopat - paid * costOfCapital) / denominator;
  const check = Number.isFinite(growth) ? valueAt(nopat, returnOnNewCapital, costOfCapital, growth) : null;
  if (check === null || Math.abs(check - paid) > 1e-6 * Math.max(1, paid)) {
    const higher = paid > standingStill;
    const adds = returnOnNewCapital > costOfCapital;
    return {
      reason:
        higher === adds
          ? "This price needs growth at or above the cost of capital for ever, which this model cannot produce."
          : `Growth ${adds ? "adds to" : "takes from"} this business's value, so no growth rate this model allows brings it ${higher ? "up to" : "down to"} that price.`,
    };
  }
  return growth;
}

/**
 * A grid of value per share: growth down the side, cost of capital across.
 *
 * A refusal is kept as null in its cell rather than dropped, so the shape of
 * what the model will not answer stays visible beside what it will.
 */
export function sensitivity(
  base: Omit<GrowthInputs, "growth" | "costOfCapital"> & Omit<EquityInputs, "firmValue">,
  growths: number[],
  costs: number[],
): (number | null)[][] {
  return growths.map((growth) =>
    costs.map((costOfCapital) => {
      const whole = firmValue({ nopat: base.nopat, returnOnNewCapital: base.returnOnNewCapital, costOfCapital, growth });
      if (!isValued(whole)) return null;
      const equity = equityFromFirm({ ...base, firmValue: whole.value });
      if (!isValued(equity)) return null;
      return equity.perReceipt ?? equity.perShare;
    }),
  );
}
