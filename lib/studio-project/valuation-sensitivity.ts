import { readInput, valuationResult, type ValuationCase } from "./valuation-cases";

export const SENSITIVITY_STEPS = [0.5, 1, 2] as const;
export type SensitivityRates = Pick<ValuationCase["inputs"], "growth" | "costOfCapital">;

/** Percentage-point changes; the center retains the exact saved input text. */
export function valuationSensitivity(record: ValuationCase, step: number) {
  if (!SENSITIVITY_STEPS.some((value) => value === step) || !valuationResult(record).ok) return null;
  const shifted = (value: string, offset: number) => offset === 0 ? value : String(Number((readInput(value) + offset).toPrecision(15)));
  return [-step, 0, step].map((growthOffset) => [-step, 0, step].map((costOffset) => {
    const rates = { growth: shifted(record.inputs.growth, growthOffset), costOfCapital: shifted(record.inputs.costOfCapital, costOffset) };
    return { rates, result: valuationResult({ ...record, inputs: { ...record.inputs, ...rates } }) };
  }));
}

/** Build a separate case; source figures and the original case remain untouched. */
export function sensitivityScenario(original: ValuationCase, rates: SensitivityRates, id: string, now: string): ValuationCase {
  const next = { ...original, inputs: { ...original.inputs, ...rates } };
  const result = valuationResult(next);
  if (!result.ok) throw new Error(result.reason);
  const label = `${rates.growth}% growth, ${rates.costOfCapital}% cost`;
  return {
    ...next, id, createdAt: now, updatedAt: now,
    name: `${original.name.slice(0, 230)} · ${label}`.slice(0, 300),
    reasoning: `Assumption test copied from ${original.name}. Review the changed rates before using this case.${original.reasoning ? `\n\nOriginal reasoning:\n${original.reasoning}` : ""}`.slice(0, 10000),
    costReference: readInput(rates.costOfCapital) === readInput(original.inputs.costOfCapital) ? original.costReference : null,
  };
}
