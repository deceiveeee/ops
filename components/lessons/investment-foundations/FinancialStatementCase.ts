export type StatementRow = {
  label: string;
  amount: number;
  section: string;
  detail?: string;
};

export const ASSET_ROWS: StatementRow[] = [
  { label: "Cash", amount: 20, section: "Current asset", detail: "Cash available at year-end" },
  { label: "Accounts receivable", amount: 30, section: "Current asset", detail: "Customer invoices not yet collected" },
  { label: "Inventory", amount: 50, section: "Current asset", detail: "Products awaiting sale" },
  { label: "Property, plant, and equipment", amount: 100, section: "Long-lived asset", detail: "Stores, equipment, and distribution facilities" },
  { label: "Goodwill", amount: 20, section: "Intangible asset", detail: "Acquisition accounting residual" },
  { label: "Right-of-use asset", amount: 30, section: "Long-lived asset", detail: "Recognized right to use leased locations" },
];

export const CLAIM_ROWS: StatementRow[] = [
  { label: "Accounts payable", amount: 35, section: "Operating liability", detail: "Supplier invoices not yet paid" },
  { label: "Lease liabilities", amount: 30, section: "Contractual claim", detail: "Recognized lease payment obligation" },
  { label: "Debt", amount: 65, section: "Debt claim", detail: "Borrowed capital" },
  { label: "Other liabilities", amount: 20, section: "Other claim", detail: "Other recognized obligations" },
  { label: "Shareholders' equity", amount: 100, section: "Residual claim", detail: "Assets left after recognized liabilities" },
];

export const INCOME_ROWS: StatementRow[] = [
  { label: "Revenue", amount: 300, section: "Revenue" },
  { label: "Other operating costs", amount: -210, section: "Operating expense" },
  { label: "R&D expense", amount: -20, section: "Operating expense" },
  { label: "Lease expense", amount: -10, section: "Operating expense" },
  { label: "Operating income", amount: 60, section: "Operating profit" },
  { label: "Interest expense", amount: -8, section: "Financing expense" },
  { label: "Tax expense", amount: -13, section: "Tax" },
  { label: "Net income", amount: 39, section: "Profit to common equity" },
];

export const CASH_ROWS: StatementRow[] = [
  { label: "Net income", amount: 39, section: "Operating" },
  { label: "Depreciation and amortization", amount: 17, section: "Operating" },
  { label: "Increase in accounts receivable", amount: -5, section: "Operating" },
  { label: "Increase in inventory", amount: -8, section: "Operating" },
  { label: "Increase in accounts payable", amount: 4, section: "Operating" },
  { label: "Cash flow from operations", amount: 47, section: "Operating total" },
  { label: "Capital expenditure", amount: -25, section: "Investing" },
  { label: "Acquisition", amount: -10, section: "Investing" },
  { label: "Cash flow from investing", amount: -35, section: "Investing total" },
  { label: "New debt", amount: 10, section: "Financing" },
  { label: "Debt repayment", amount: -5, section: "Financing" },
  { label: "Dividends", amount: -8, section: "Financing" },
  { label: "Buybacks", amount: -4, section: "Financing" },
  { label: "Cash flow from financing", amount: -7, section: "Financing total" },
  { label: "Net change in cash", amount: 5, section: "Reconciliation" },
];

export const R_AND_D_HISTORY = [
  { age: 0, label: "Current year", expense: 20, unamortized: 1 },
  { age: 1, label: "One year ago", expense: 18, unamortized: 0.8 },
  { age: 2, label: "Two years ago", expense: 15, unamortized: 0.6 },
  { age: 3, label: "Three years ago", expense: 12, unamortized: 0.4 },
  { age: 4, label: "Four years ago", expense: 10, unamortized: 0.2 },
] as const;

export const CASE_RESULTS = {
  totalAssets: 250,
  totalLiabilities: 150,
  equity: 100,
  operatingMargin: 20,
  netMargin: 13,
  returnOnEquity: 39,
  debtToCapital: 39.4,
  debtToCapitalWithLeases: 48.7,
  interestCoverage: 7.5,
  leasePresentValue: 9.385,
  researchAsset: 50.2,
  researchAmortization: 11,
  adjustedOperatingIncome: 69,
  baseReturnOnCapital: 25.7,
  adjustedReturnOnCapital: 23,
  cfo: 47,
  cfi: -35,
  cff: -7,
  cashChange: 5,
  fcfe: 27,
  fcff: 28,
} as const;

export function money(value: number) {
  const sign = value < 0 ? "−" : "";
  return `${sign}$${Math.abs(value).toFixed(value % 1 === 0 ? 0 : 1)}m`;
}
