/** Historical Board of Governors H.15 observations; see docs/source-audits/website-teaching-visuals.md. */
export const federalFundsHistory = [
  ["2022-01", 0.08], ["2022-02", 0.08], ["2022-03", 0.20], ["2022-04", 0.33],
  ["2022-05", 0.77], ["2022-06", 1.21], ["2022-07", 1.68], ["2022-08", 2.33],
  ["2022-09", 2.56], ["2022-10", 3.08], ["2022-11", 3.78], ["2022-12", 4.10],
  ["2023-01", 4.33], ["2023-02", 4.57], ["2023-03", 4.65], ["2023-04", 4.83],
  ["2023-05", 5.06], ["2023-06", 5.08], ["2023-07", 5.12], ["2023-08", 5.33],
  ["2023-09", 5.33], ["2023-10", 5.33], ["2023-11", 5.33], ["2023-12", 5.33],
  ["2024-01", 5.33], ["2024-02", 5.33], ["2024-03", 5.33], ["2024-04", 5.33],
  ["2024-05", 5.33], ["2024-06", 5.33], ["2024-07", 5.33], ["2024-08", 5.33],
  ["2024-09", 5.13], ["2024-10", 4.83], ["2024-11", 4.64], ["2024-12", 4.48],
] as const;

export const federalFundsSource = "https://www.federalreserve.gov/releases/h15/";
export const federalFundsDownload = "https://www.federalreserve.gov/datadownload/Output.aspx?rel=H15&series=40afb80a445c5903ca2c4888e40f3f1f&lastobs=&from=01/01/2022&to=12/31/2024&filetype=csv&label=include&layout=seriescolumn";

export const atkoreReport = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm";
/** USD thousands, as filed in Item 7, Results of Operations, fiscal 2025 vs 2024. */
export const atkoreResults = [
  { label: "Net sales", previous: 3202053, latest: 2850378, definition: "Net sales is revenue from customers after items such as discounts and returns." },
  { label: "Operating income", previous: 624784, latest: 23173, definition: "Operating income is sales less production and operating costs, before interest and income tax." },
] as const;

export const percentageChange = (before: number, after: number) => (after / before - 1) * 100;

export function recoveryAfterLoss(lossPercent: number) {
  if (!Number.isFinite(lossPercent) || lossPercent < 0 || lossPercent >= 100) {
    throw new RangeError("Loss must be between 0% and less than 100%.");
  }
  return { remaining: 100 - lossPercent, gainPercent: lossPercent / (100 - lossPercent) * 100 };
}
