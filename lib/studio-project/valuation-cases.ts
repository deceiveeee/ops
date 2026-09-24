import { equityFromFirm, firmValue, firmValueAtPrice, impliedGrowth, isValued } from "./valuation";
import type { StudioProject } from "./schema";

export const VALUATION_INPUTS = ["nopat", "debt", "cash", "shares", "receipt", "growth", "returnOnCapital", "costOfCapital", "price"] as const;
export type ValuationInput = typeof VALUATION_INPUTS[number];
export interface ValuationCase {
  id: string; name: string; company: string; ticker: string; cik: string;
  model: "stable-growth-v1"; createdAt: string; updatedAt: string;
  inputs: Record<ValuationInput, string>;
  priceAsOf: string; reasoning: string; example: boolean;
  costReference?: { industry: string; ratePct: number; notes: string[] } | null;
  source: null | { url: string; periodEnd: string; fetchedAt: string; sharesConcept: string; figures: { key: string; value: number; concepts: string[] }[] };
}
export function newValuation(example = false, now = new Date().toISOString()): ValuationCase {
  return {
    id: `value-${crypto.randomUUID()}`, name: example ? "Worked example" : "Base case", company: example ? "OPS example company" : "", ticker: "", cik: "",
    model: "stable-growth-v1", createdAt: now, updatedAt: now, priceAsOf: "", reasoning: "", example, source: null,
    inputs: { nopat: example ? "150" : "", debt: example ? "300" : "", cash: example ? "100" : "", shares: example ? "100" : "", receipt: "1", growth: example ? "2" : "", returnOnCapital: example ? "16.666667" : "", costOfCapital: example ? "10" : "", price: example ? "13" : "" },
  };
}
export function valuationResult(record: ValuationCase) {
  const number = (key: ValuationInput) => record.inputs[key].trim() === "" ? NaN : Number(record.inputs[key]);
  const required = VALUATION_INPUTS.filter((key) => key !== "price");
  if (required.some((key) => !Number.isFinite(number(key)))) return { ok: false as const, reason: "Complete the financial figures and the three assumptions to calculate a value." };
  if (number("receipt") <= 0) return { ok: false as const, reason: "Company shares per traded share must be above zero. Use 1 for an ordinary share." };
  const model = { nopat: number("nopat"), growth: number("growth") / 100, returnOnNewCapital: number("returnOnCapital") / 100, costOfCapital: number("costOfCapital") / 100 };
  const business = firmValue(model);
  if (!isValued(business)) return { ok: false as const, reason: business.reason };
  const bridge = { debt: number("debt"), cash: number("cash"), shares: number("shares"), sharesPerReceipt: number("receipt") };
  const equity = equityFromFirm({ ...bridge, firmValue: business.value });
  if (!isValued(equity)) return { ok: false as const, reason: equity.reason };
  if (![business.value, equity.equityValue, equity.perShare, equity.perReceipt ?? 0].every(Number.isFinite)) return { ok: false as const, reason: "These inputs exceed the numerical range this model can represent." };
  const price = number("price");
  const paid = Number.isFinite(price) && price > 0 ? firmValueAtPrice({ ...bridge, price }) : null;
  const reverse = paid !== null && isValued(paid) ? impliedGrowth({ ...model, firmValue: paid }) : null;
  return { ok: true as const, business, equity, value: equity.perReceipt ?? equity.perShare, price: Number.isFinite(price) && price > 0 ? price : null, reverse };
}
export function saveValuation(project: StudioProject, record: ValuationCase): StudioProject {
  const previous = project.valuations ?? [];
  return { ...project, updatedAt: record.updatedAt, valuations: previous.some((v) => v.id === record.id) ? previous.map((v) => v.id === record.id ? record : v) : [...previous, record] };
}
export function validValuationCase(value: unknown): value is ValuationCase {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some((k) => !["id", "name", "company", "ticker", "cik", "model", "createdAt", "updatedAt", "inputs", "priceAsOf", "reasoning", "example", "source", "costReference"].includes(k))) return false;
  if (!["id", "name", "company", "ticker", "cik", "reasoning", "priceAsOf"].every((k) => typeof v[k] === "string" && String(v[k]).length <= (k === "reasoning" ? 10000 : 300))) return false;
  if (!String(v.id).trim() || v.model !== "stable-growth-v1" || typeof v.example !== "boolean") return false;
  if (v.priceAsOf !== "" && (!/^\d{4}-\d{2}-\d{2}$/.test(String(v.priceAsOf)) || !Number.isFinite(Date.parse(String(v.priceAsOf))) || new Date(String(v.priceAsOf)).toISOString().slice(0, 10) !== v.priceAsOf)) return false;
  if (![v.createdAt, v.updatedAt].every((d) => typeof d === "string" && Number.isFinite(Date.parse(d)))) return false;
  if (!v.inputs || typeof v.inputs !== "object" || Array.isArray(v.inputs)) return false;
  const input = v.inputs as Record<string, unknown>;
  if (Object.keys(input).length !== VALUATION_INPUTS.length || !VALUATION_INPUTS.every((key) => typeof input[key] === "string" && String(input[key]).length <= 100)) return false;
  if (v.costReference !== undefined && v.costReference !== null) {
    const ref = v.costReference as { industry?: unknown; ratePct?: unknown; notes?: unknown };
    if (typeof ref !== "object" || Array.isArray(ref) || Object.keys(ref).some((k) => !["industry", "ratePct", "notes"].includes(k)) || typeof ref.industry !== "string" || ref.industry.length > 300 || typeof ref.ratePct !== "number" || !Number.isFinite(ref.ratePct) || !Array.isArray(ref.notes) || ref.notes.length > 10 || !ref.notes.every((n) => typeof n === "string" && n.length < 2000)) return false;
  }
  if (v.source !== null) {
    if (!v.source || typeof v.source !== "object" || Array.isArray(v.source)) return false;
    const s = v.source as Record<string, unknown>;
    if (Object.keys(s).some((k) => !["url", "periodEnd", "fetchedAt", "sharesConcept", "figures"].includes(k))) return false;
    if (typeof s.url !== "string" || !/^https:\/\/www\.sec\.gov\//.test(s.url) || s.url.length > 2000 || typeof s.periodEnd !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s.periodEnd) || typeof s.sharesConcept !== "string" || s.sharesConcept.length > 300 || typeof s.fetchedAt !== "string" || !Number.isFinite(Date.parse(s.fetchedAt))) return false;
    if (!Array.isArray(s.figures) || s.figures.length > 30 || !s.figures.every((f) => f && typeof f === "object" && Object.keys(f).every((k) => ["key", "value", "concepts"].includes(k)) && typeof f.key === "string" && f.key.length < 100 && typeof f.value === "number" && Number.isFinite(f.value) && Array.isArray(f.concepts) && f.concepts.length < 30 && f.concepts.every((c: unknown) => typeof c === "string" && c.length < 300))) return false;
  }
  return true;
}
