export type GrowthValuationInput = {
  afterTaxOperatingIncome: number;
  growthRate: number;
  returnOnCapital: number;
  costOfCapital: number;
};

export type GrowthValuationResult = GrowthValuationInput & {
  reinvestmentRate: number;
  cashFlowAfterReinvestment: number;
  enterpriseValue: number;
  valueSpread: number;
};

function requireFinitePositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a finite positive number.`);
  }
}

export function calculateGrowthValuation(
  input: GrowthValuationInput,
): GrowthValuationResult {
  requireFinitePositive(
    input.afterTaxOperatingIncome,
    "After-tax operating income",
  );
  requireFinitePositive(input.returnOnCapital, "Return on capital");
  requireFinitePositive(input.costOfCapital, "Cost of capital");

  if (!Number.isFinite(input.growthRate) || input.growthRate < 0) {
    throw new RangeError("Growth rate must be finite and non-negative.");
  }
  if (input.growthRate >= input.costOfCapital) {
    throw new RangeError("Growth rate must be below cost of capital.");
  }

  const reinvestmentRate = input.growthRate / input.returnOnCapital;
  const cashFlowAfterReinvestment =
    input.afterTaxOperatingIncome * (1 - reinvestmentRate);
  const enterpriseValue =
    cashFlowAfterReinvestment / (input.costOfCapital - input.growthRate);

  return {
    ...input,
    reinvestmentRate,
    cashFlowAfterReinvestment,
    enterpriseValue,
    valueSpread: input.returnOnCapital - input.costOfCapital,
  };
}

export function calculateBufferedPrice(
  baseValue: number,
  decisionBuffer: number,
) {
  requireFinitePositive(baseValue, "Base value");
  if (
    !Number.isFinite(decisionBuffer) ||
    decisionBuffer < 0 ||
    decisionBuffer >= 1
  ) {
    throw new RangeError("Decision buffer must be at least 0% and below 100%.");
  }
  return baseValue * (1 - decisionBuffer);
}

export function calculateValueToPriceGap(value: number, price: number) {
  requireFinitePositive(value, "Value");
  requireFinitePositive(price, "Price");
  return value / price - 1;
}
