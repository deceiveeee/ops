/**
 * Return on invested capital, and the two things it is made of.
 *
 * Definitions here come from *Measuring the Moat* and *ROIC and the Investment
 * Process* (Michael Mauboussin and Dan Callahan, Counterpoint Global, Morgan
 * Stanley Investment Management, 2025), which state:
 *
 * - ROIC is net operating profit after taxes divided by invested capital —
 *   "how much the company makes compared to how much it has spent on its
 *   business".
 * - It decomposes, DuPont style, into NOPAT margin (NOPAT ÷ sales) times
 *   invested capital turnover (sales ÷ invested capital). The sales cancel and
 *   what is left is ROIC.
 * - The decomposition is what makes it useful: a company earning good returns
 *   through **differentiation** shows a high margin with a satisfactory
 *   turnover, and one earning them through **cost leadership** shows a
 *   satisfactory margin with a high turnover. The single ROIC number says
 *   whether value is being created; only the split says how.
 *
 * **What the papers do not give, and this file therefore decides.** Neither
 * states a line-item formula for invested capital — they say only that it is
 * derived from the financial statements companies report. So the definition
 * below is OPS's, and it is stated rather than implied:
 *
 *     invested capital = interest-bearing debt + shareholders' equity − cash
 *
 * That pairs with the numerator on purpose. NOPAT is the profit available to
 * everyone who financed the business, lenders and shareholders alike, so the
 * denominator has to be what both of them put in. A different and equally
 * common convention, total assets less non-debt current liabilities, was
 * measured against this one across twelve companies and ran 5% to 28% higher,
 * because it leaves long-term non-debt liabilities inside the capital base.
 * Neither is wrong; they are different questions, and mixing them silently
 * would be.
 *
 * **Operating leases are outside this definition** and reported beside it,
 * because they are large enough to change the answer — $19.0B at Verizon,
 * $16.5B at Microsoft — and because whether to treat them as debt is a real
 * disagreement rather than a settled fact.
 *
 * Also worth knowing: both papers exclude financial and real-estate companies
 * from their ROIC work, "because their accounting is different than the rest".
 * The sector rules in `metrics.ts` reach the same conclusion independently.
 */

/**
 * The accounting shapes `metrics.ts` recognises.
 *
 * Restated here rather than imported so this module, like `prices.ts`, has no
 * imports at all and can be loaded straight from a script by Node's type
 * stripper. `roic.test.ts` asserts the two stay in step.
 */
export type RoicSector = "banking" | "insurance" | "real-estate" | "utility" | "transport" | "extractive" | "general";

/**
 * Sectors where both papers decline to compute ROIC at all, "because their
 * accounting is different than the rest".
 *
 * Not a nicety. Prologis computes to a 46.9% NOPAT margin on 0.10x turnover,
 * which reads as a textbook differentiation strategy and is really an artefact:
 * a property company's invested capital is buildings at depreciated historical
 * cost, so the denominator bears little relation to what the assets are worth.
 * The same objection is why `metrics.ts` refuses free cash flow for banks.
 */
export const ROIC_EXCLUDED_SECTORS: readonly RoicSector[] = ["banking", "insurance", "real-estate"];

const EXCLUDED_LABEL: Record<string, string> = {
  banking: "a bank",
  insurance: "an insurer",
  "real-estate": "a property company",
};

export interface RoicInputs {
  /** When given, the sectors the papers exclude are declined rather than computed. */
  sector?: RoicSector;
  operatingIncome: number;
  /** As a fraction. Used to turn operating profit into an after-tax figure. */
  effectiveTaxRate: number;
  revenue: number;
  /** Interest-bearing borrowings, long and short term. Excludes leases. */
  totalDebt: number;
  equity: number;
  cash: number;
}

export interface RoicDecomposition {
  nopat: number;
  investedCapital: number;
  roic: number;
  /** NOPAT ÷ sales. High here is the signature of differentiation. */
  nopatMargin: number;
  /** Sales ÷ invested capital. High here is the signature of cost leadership. */
  capitalTurnover: number;
}

export interface RoicUnavailable {
  reason: string;
}

export type RoicOutcome = RoicDecomposition | RoicUnavailable;
export const isComputed = (outcome: RoicOutcome): outcome is RoicDecomposition => "roic" in outcome;

/**
 * Operating profit after tax.
 *
 * The tax rate is the company's own effective rate rather than a statutory one,
 * so a business that actually pays little tax is not charged as though it paid
 * the headline rate. A negative rate — which happens, and which the metric layer
 * reports rather than hides — would raise NOPAT above operating income, so it is
 * held at zero: a tax credit is not operating performance.
 */
export function nopat(operatingIncome: number, effectiveTaxRate: number): number {
  return operatingIncome * (1 - Math.max(0, effectiveTaxRate));
}

/** Debt plus equity less cash. See the note at the top for why this pairing. */
export function investedCapital({ totalDebt, equity, cash }: Pick<RoicInputs, "totalDebt" | "equity" | "cash">): number {
  return totalDebt + equity - cash;
}

/**
 * ROIC, split into the margin and the turnover that produce it.
 *
 * Refuses rather than returning a number nobody can read. Negative invested
 * capital happens — a company with more cash than debt and equity — and the
 * ratio it produces flips sign for a reason that has nothing to do with
 * performance, so it is declined instead.
 */
export function decomposeRoic(inputs: RoicInputs): RoicOutcome {
  if (inputs.sector && ROIC_EXCLUDED_SECTORS.includes(inputs.sector)) {
    return {
      reason: `return on invested capital is not a meaningful measure for ${EXCLUDED_LABEL[inputs.sector]}, whose accounting puts a different meaning on both the profit and the capital`,
    };
  }

  const capital = investedCapital(inputs);
  if (!(capital > 0)) {
    return {
      reason:
        "invested capital is not positive, which happens when cash exceeds debt and equity; ROIC would change sign for a reason unrelated to performance",
    };
  }
  if (!(inputs.revenue > 0)) {
    return { reason: "revenue is not positive, so the margin and turnover it splits into are not defined" };
  }

  const profit = nopat(inputs.operatingIncome, inputs.effectiveTaxRate);
  return {
    nopat: profit,
    investedCapital: capital,
    roic: profit / capital,
    nopatMargin: profit / inputs.revenue,
    capitalTurnover: inputs.revenue / capital,
  };
}

/**
 * Which of the two routes to a good return a company is taking.
 *
 * The paper reads this off a scatter of the whole population: the bottom right,
 * high margin and low turnover, is where differentiation lives; the top left,
 * low margin and high turnover, is cost leadership. That is a *relative*
 * reading, so it needs a peer group. There are no absolute thresholds here
 * because inventing them would put a number on the page that no source supports.
 */
export type Advantage = "differentiation" | "cost leadership" | "both" | "neither";

export interface AdvantageRead {
  advantage: Advantage;
  /** Where the company sits among peers, 0 to 1. */
  marginPercentile: number;
  turnoverPercentile: number;
  peerCount: number;
  /** Peer medians, so the comparison can be shown rather than asserted. */
  medianMargin: number;
  medianTurnover: number;
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const percentileOf = (value: number, population: number[]): number =>
  population.length ? population.filter((other) => other < value).length / population.length : 0;

/**
 * Read a company's advantage against its peers.
 *
 * Requires a real peer group. With fewer than five comparable companies the
 * medians are not a population and the answer would be an artefact of who
 * happened to be in the list, so it declines.
 */
export function readAdvantage(
  company: RoicDecomposition,
  peers: RoicDecomposition[],
  { minimumPeers = 5, high = 0.6, hurdle = 0.08 }: { minimumPeers?: number; high?: number; hurdle?: number } = {},
): AdvantageRead | { reason: string } {
  if (peers.length < minimumPeers) {
    return { reason: `needs at least ${minimumPeers} comparable companies to say what is high or low; ${peers.length} given` };
  }

  // The paper describes these as the routes by which companies "enjoy
  // attractive ROICs" and are "successful because of cost leadership". They
  // explain a good return; they do not classify a bad one. Atkore's loss year
  // came out as cost leadership on a 0.6% margin, because its capital happened
  // to turn over quickly — which describes failure as a strategy.
  if (!(company.roic > hurdle)) {
    return {
      reason: `this explains how a company earns an attractive return, and a ${(company.roic * 100).toFixed(1)}% return on capital is not one; the split is still shown above`,
    };
  }

  const margins = peers.map((peer) => peer.nopatMargin);
  const turnovers = peers.map((peer) => peer.capitalTurnover);
  const marginPercentile = percentileOf(company.nopatMargin, margins);
  const turnoverPercentile = percentileOf(company.capitalTurnover, turnovers);

  const strongMargin = marginPercentile >= high;
  const strongTurnover = turnoverPercentile >= high;

  return {
    advantage: strongMargin && strongTurnover ? "both" : strongMargin ? "differentiation" : strongTurnover ? "cost leadership" : "neither",
    marginPercentile,
    turnoverPercentile,
    peerCount: peers.length,
    medianMargin: median(margins),
    medianTurnover: median(turnovers),
  };
}

/**
 * Economic profit: the spread over the cost of capital, times the capital.
 *
 * The paper's threshold for value creation, and the quantity a profit pool is
 * drawn from. WACC is not in any filing — it needs a cost of equity, so it is
 * someone's estimate and must arrive with its own provenance rather than being
 * presented as a fact read off a statement.
 */
export function economicProfit(decomposition: RoicDecomposition, wacc: number): { spread: number; economicProfit: number } {
  const spread = decomposition.roic - wacc;
  return { spread, economicProfit: spread * decomposition.investedCapital };
}
