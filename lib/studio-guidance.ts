export type StudioGuidanceKey = "goal" | "research" | "build" | "risk" | "buy" | "review";

export type StudioGuidance = {
  title: string;
  definition: string;
  example: string;
  action: string;
  terms: { term: string; definition: string }[];
  sources: { label: string; url: string }[];
};

const ALLOCATION_SOURCE = {
  label: "SEC: allocation, diversification and rebalancing",
  url: "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
};

const BOND_SOURCE = {
  label: "FINRA: bond prices and accrued interest",
  url: "https://www.finra.org/investors/investing/investment-products/bonds",
};

/**
 * Standalone explanations: every stage can be entered without course completion.
 * Examples are OPS teaching cases, never suggested holdings or target weights.
 * Source and learner-sequence ledger: docs/source-audits/studio-learning.md.
 */
export const STUDIO_GUIDANCE: Record<StudioGuidanceKey, StudioGuidance> = {
  goal: {
    title: "Give the money a job",
    definition:
      "A portfolio is a collection of investments. Your goal states what the money must pay for and when. Cash needs and the loss you can afford guide every later choice.",
    example:
      "OPS example: of $10,000 available, $2,000 is needed next year. Setting that amount aside leaves $8,000 for the longer goal. Adding $200 a month supplies another $2,400 over a year, before investment gains or losses.",
    action:
      "Record your goal, deadline, available money and contributions. Separate money needed soon, check your emergency reserve and debt, then state the dollar loss your goal could absorb. Use a practice plan if your circumstances are still uncertain.",
    terms: [
      { term: "Time horizon", definition: "The time until you expect to use the money." },
      { term: "Emergency reserve", definition: "Money set aside for unexpected expenses or lost income. Choose its size from your circumstances." },
      { term: "Capacity for loss", definition: "The financial loss you could absorb while still meeting your needs." },
      { term: "Willingness for loss", definition: "How much fluctuation you feel able to live with and continue following your plan." },
      { term: "Liquidity", definition: "How readily an investment can become spendable cash at a reasonable price." },
    ],
    sources: [
      {
        label: "SEC: investor preparedness",
        url: "https://www.investor.gov/introduction-investing/general-resources/investor-preparedness-checklist",
      },
      {
        label: "CFPB: building an emergency fund",
        url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
      },
    ],
  },
  research: {
    title: "Understand what you would own",
    definition:
      "Research connects an investment's exact identity to the businesses, payments and risks behind it. Keep a dated source, a reason to own it and a fact that would make you reconsider.",
    example:
      "OPS example: a foreign manufacturer sells in Europe and Asia through a US-dollar ADR. A US trading price describes how you pay; the company's customers, suppliers and currencies still shape its profits. Check the business evidence and ADR terms separately.",
    action:
      "Open the official source. For a fund, inspect its holdings, objective and costs; for a stock, inspect cash, debt and value assumptions; for a bond, inspect promised payments and repayment risk. Compare an alternative and record the source date before choosing.",
    terms: [
      { term: "Stock", definition: "An ownership share in a company, with value that depends on the business and the price investors will pay." },
      { term: "Bond", definition: "A loan to an issuer with stated payment terms. The issuer's ability to pay and the price of selling early both matter." },
      { term: "Fund", definition: "A pool of investors' money used to hold investments under a stated strategy." },
      { term: "ETF", definition: "An exchange-traded fund: a fund whose shares trade on an exchange during the trading day." },
      { term: "ADR", definition: "An American Depositary Receipt: a security representing a specified number or fraction of a foreign company's shares. Check its share ratio and depositary fees." },
      { term: "Business exposure", definition: "The companies, industries, customers, countries and currencies that can affect your investment's results." },
      { term: "Domicile and trading currency", definition: "Domicile is the legal home of a company or fund; trading currency is the money used to quote its price. Research where its underlying business earns and spends separately." },
      { term: "Valuation range", definition: "An estimate of worth under different cash-flow, growth and risk assumptions. The range changes when those assumptions change." },
    ],
    sources: [
      {
        label: "SEC: international investing",
        url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/international-investing",
      },
      {
        label: "SEC: American Depositary Receipts",
        url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-88",
      },
      {
        label: "Damodaran: the Investment Philosophies source course",
        url: "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm",
      },
    ],
  },
  build: {
    title: "Decide how much each holding gets",
    definition:
      "Allocation divides your portfolio among investments. A weight expresses each holding as a percentage of the whole, including cash. Together those weights account for 100% of your money.",
    example:
      "OPS example: a 25% weight in a $10,000 portfolio assigns $2,500 to that holding. Two funds can own the same company, so adding a second fund can increase the money depending on that company.",
    action:
      "Give each chosen holding a job and a weight. Check the remaining cash and total, then inspect repeated companies, industries and countries. Test the result against your goal and loss limit before accepting the mix.",
    terms: [
      { term: "Weight", definition: "A holding's value divided by the whole portfolio value, expressed as a percentage." },
      { term: "Diversification", definition: "Spreading exposure across investments whose results can differ. Its effect depends on what you own and how those investments behave together." },
      { term: "Overlap", definition: "Exposure to the same investment through more than one holding, such as a company held directly and inside a fund." },
      { term: "Concentration", definition: "A large part of your money depending on one company, industry, country or other shared source of risk." },
    ],
    sources: [ALLOCATION_SOURCE],
  },
  risk: {
    title: "See what a setback would cost",
    definition:
      "A stress test applies stated losses to your chosen holdings and adds their dollar effects. A cost estimate shows money lost to fund charges and trading. Both results depend on the assumptions you enter.",
    example:
      "OPS example: if 40% of $10,000 falls 25% and everything else stays flat, the portfolio loses $1,000, or 10%. A separate 0.20% annual fund expense on a constant $10,000 is about $20; trading and tax costs are additional.",
    action:
      "Change a loss assumption and inspect each holding's contribution. Compare the total with your dollar loss limit. Review repeated exposures, bond payment risks, currency effects and costs; revise the weights or explain why the remaining risk fits your goal.",
    terms: [
      { term: "Stress loss", definition: "The loss calculated from a chosen adverse scenario. Actual outcomes can be better or worse." },
      { term: "Expense ratio", definition: "A fund's annual operating expenses as a percentage of its assets, paid from the fund. Your dollar cost varies with the value held." },
      { term: "Bid-ask spread", definition: "The gap between the quoted price a buyer offers and the price a seller asks." },
      { term: "Currency risk", definition: "Changes in exchange rates can change a US investor's result. In an OPS unhedged example, a foreign share rises 10% while its currency loses 10% against the dollar: 1.10 × 0.90 gives a 1% dollar loss before costs." },
      { term: "Duration", definition: "A measure of bond price sensitivity to changes in yield. Greater duration generally means a larger price change for the same yield movement." },
      { term: "Default risk", definition: "The possibility that a borrower misses a promised interest or principal payment." },
    ],
    sources: [
      BOND_SOURCE,
      {
        label: "SEC: understanding fees",
        url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-funds-etfs/mutual-funds",
      },
      {
        label: "FINRA: currency exposure",
        url: "https://www.finra.org/investors/insights/currency-risk-why-it-matters-you",
      },
    ],
  },
  buy: {
    title: "Turn weights into a buying worksheet",
    definition:
      "A buying worksheet converts your dollar plan into estimated quantities and cash needs. Stocks and ETFs use share prices. A conventional bond quote expresses its price as a percentage of face value, with accrued interest handled separately.",
    example:
      "OPS examples: $500 at $60 per share allows 8 whole shares for $480, leaving $20 before costs. A bond with $1,000 face value quoted at 98.5 costs $985 before accrued interest. Adding $10 accrued interest and $2 of separate fees brings the cash needed to $997.",
    action:
      "Confirm exact identity, currency, price date and trading unit. For bonds, confirm the quote convention, minimum face amount, accrued interest and fees with the broker. Check available cash and fractional-share support, then export the worksheet for your own review.",
    terms: [
      { term: "Reference price", definition: "The dated price used for this estimate. The price available when you act can change." },
      { term: "Face value", definition: "The principal amount a bond promises to repay under its terms. A $1,000 face amount can trade for a different cash price." },
      { term: "Accrued interest", definition: "Interest earned since a bond's last coupon payment. A buyer generally pays the seller this amount in addition to a price quoted without it." },
      { term: "Trading increment", definition: "The smallest permitted step in an order's quantity or face amount, as specified for that security and broker." },
      { term: "Market order", definition: "An instruction to trade at the best available price; the final execution price can differ from your reference price." },
      { term: "Limit order", definition: "An instruction to buy at your maximum price or lower, or sell at your minimum price or higher. Execution may never occur." },
    ],
    sources: [
      BOND_SOURCE,
      {
        label: "SEC: market and limit orders",
        url: "https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-14",
      },
    ],
  },
  review: {
    title: "Write the rules you will follow",
    definition:
      "Operating rules state when you review your portfolio and what changes deserve action. Rebalancing moves actual weights toward the targets you chose, using trades or the direction of money entering and leaving the portfolio.",
    example:
      "OPS example: a holding grows from a target weight of 20% to 26%, a rise of 6 percentage points. If your own review band is 5 points, that triggers a review. Compare directing new money elsewhere with selling, including the costs of each.",
    action:
      "Set a review date, a weight-change trigger and rules for contributions, withdrawals and selling. Name the evidence that would overturn each reason to own. Recheck the plan after a life change, stale source or changed investment; save the reasons for your decision.",
    terms: [
      { term: "Drift", definition: "The difference between a holding's actual weight and its target weight." },
      { term: "Percentage point", definition: "The unit used to subtract percentages: 26% minus 20% is 6 percentage points." },
      { term: "Review band", definition: "A weight difference you choose as a reason to review. Its size is your policy choice." },
      { term: "Benchmark", definition: "A stated comparison used to judge results, chosen to reflect the investments and risks in the plan." },
      { term: "What would prove it wrong", definition: "A specific observation that would contradict your reason to own an investment and require reconsideration." },
    ],
    sources: [ALLOCATION_SOURCE],
  },
};
