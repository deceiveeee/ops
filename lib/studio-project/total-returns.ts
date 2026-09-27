/** Monthly total returns. Conventions: docs/source-audits/studio-total-returns-and-valuation-workspace.md. */
export interface MonthlyReturn { month: string; value: number }
export type ReturnBasis = "market-price" | "net-asset-value";
export interface ReturnHistory {
  id: string;
  instrumentId: string;
  sourceName: string;
  sourceUrl: string;
  currency: string;
  basis: ReturnBasis;
  method: "reported-total-return" | "adjusted-close";
  importedAt: string;
  observations: MonthlyReturn[];
}
export type ReturnResult = { ok: true; observations: MonthlyReturn[]; method: ReturnHistory["method"] } | { ok: false; error: string };
export function validSourceUrl(value: string): boolean {
  if (!value) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}
export const monthNumber = (month: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? Number(month.slice(0, 4)) * 12 + Number(month.slice(5)) - 1 : NaN;
export function monthAt(index: number): string { return `${Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, "0")}`; }
export function historyProblem(rows: MonthlyReturn[]): string | null {
  if (rows.length < 1 || rows.length > 1200) return "Use between 1 and 1,200 monthly returns.";
  let wealth = 100;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!Number.isFinite(monthNumber(row.month)) || !Number.isFinite(row.value) || row.value <= -1) return "Each month needs a valid date and a finite return greater than −100%.";
    if (i && monthNumber(row.month) !== monthNumber(rows[i - 1].month) + 1) return "Months must be consecutive, oldest first, with no duplicates. Missing months are not zero returns.";
    wealth *= 1 + row.value;
    if (!Number.isFinite(wealth) || wealth <= 0) return "These returns exceed the numerical range this history can represent.";
  }
  return null;
}
/** Strict two-column contract avoids ambiguous raw prices, percentages and corporate-action columns. */
export function importMonthlyReturns(csv: string, adjustmentsConfirmed: boolean): ReturnResult {
  if (csv.length > 250_000) return { ok: false, error: "Use a monthly CSV smaller than 250 KB." };
  const lines = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const cells = (line: string) => line.split(",").map((cell) => cell.trim().replace(/^"([^"\r\n]*)"$/, "$1"));
  const header = cells(lines[0] ?? "").join(",").toLowerCase();
  if (!["month,total_return_pct", "month,adjusted_close"].includes(header)) return { ok: false, error: "Use month,total_return_pct or month,adjusted_close. Raw close prices and separate dividend or split columns are not total-return histories." };
  const adjusted = header.endsWith("adjusted_close");
  if (adjusted && !adjustmentsConfirmed) return { ok: false, error: "Confirm that your source adjusts these levels for both distributions and splits." };
  const rows: { month: string; value: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = cells(lines[i]);
    if (row.length !== 2 || !/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(row[1])) return { ok: false, error: `Row ${i + 1} needs a month and one number. Empty values are not zero.` };
    rows.push({ month: row[0], value: Number(row[1]) });
  }
  if (!rows.length || rows.length > 1201) return { ok: false, error: "Include monthly observations, up to 1,201 adjusted levels or 1,200 returns." };
  for (let i = 0; i < rows.length; i++) {
    if (!Number.isFinite(monthNumber(rows[i].month)) || !Number.isFinite(rows[i].value)) return { ok: false, error: `Row ${i + 2} needs a YYYY-MM month and a finite number.` };
    if (i && monthNumber(rows[i].month) !== monthNumber(rows[i - 1].month) + 1) return { ok: false, error: "Months must be consecutive, oldest first, with no duplicates. Missing months are not zero returns." };
    if (adjusted && rows[i].value <= 0) return { ok: false, error: "Adjusted levels must be above zero." };
  }
  const observations = adjusted ? rows.slice(1).map((row, i) => ({ month: row.month, value: row.value / rows[i].value - 1 })) : rows.map((row) => ({ ...row, value: row.value / 100 }));
  const error = historyProblem(observations);
  return error ? { ok: false, error } : { ok: true, observations, method: adjusted ? "adjusted-close" : "reported-total-return" };
}
export function cumulativeReturn(rows: MonthlyReturn[]): number | null {
  if (historyProblem(rows)) return null;
  const result = rows.reduce((wealth, row) => wealth * (1 + row.value), 1) - 1;
  return Number.isFinite(result) ? result : null;
}
/** Backups are untrusted. Validate before a history can become model input. */
export function validReturnHistory(value: unknown): value is ReturnHistory {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some((key) => !["id", "instrumentId", "sourceName", "sourceUrl", "currency", "basis", "method", "importedAt", "observations"].includes(key))) return false;
  if (!["id", "instrumentId", "sourceName"].every((key) => typeof v[key] === "string" && String(v[key]).trim().length > 0 && String(v[key]).length <= 300)) return false;
  if (typeof v.sourceUrl !== "string" || v.sourceUrl.length > 2000 || !validSourceUrl(v.sourceUrl)) return false;
  if (typeof v.currency !== "string" || !/^[A-Z]{3}$/.test(v.currency) || !["market-price", "net-asset-value"].includes(String(v.basis)) || !["reported-total-return", "adjusted-close"].includes(String(v.method))) return false;
  if (typeof v.importedAt !== "string" || !Number.isFinite(Date.parse(v.importedAt))) return false;
  if (!Array.isArray(v.observations) || v.observations.some((r) => !r || typeof r !== "object" || Object.keys(r).some((key) => !["month", "value"].includes(key)) || typeof r.month !== "string" || typeof r.value !== "number")) return false;
  return historyProblem(v.observations as MonthlyReturn[]) === null;
}
