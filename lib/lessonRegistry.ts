import type { ComponentType } from "react";
import Lesson1 from "@/components/lessons/intro-course-overview/Lesson1";
import Lesson2 from "@/components/lessons/intro-course-overview/Lesson2";
import Lesson3 from "@/components/lessons/intro-course-overview/Lesson3";
import Lesson4 from "@/components/lessons/intro-course-overview/Lesson4";
import Lesson5 from "@/components/lessons/intro-course-overview/Lesson5";
import PVCashflowsNPV from "@/components/lessons/present-value-relations/Lesson1";
import PVSpecialCashflows from "@/components/lessons/present-value-relations/Lesson2";
import PVInflation from "@/components/lessons/present-value-relations/Lesson3";
import PVCFODecisionRoom from "@/components/lessons/present-value-relations/Lesson4";
import FIBondMarkets from "@/components/lessons/fixed-income-securities/Lesson3_1";
import FISpotRates from "@/components/lessons/fixed-income-securities/Lesson3_2";
import FIArbitrageDuration from "@/components/lessons/fixed-income-securities/Lesson3_3";
import FICreditRisk from "@/components/lessons/fixed-income-securities/Lesson3_4";
import EqOwnership from "@/components/lessons/equities/Lesson4_1";
import EqDDM from "@/components/lessons/equities/Lesson4_2";
import EqGordon from "@/components/lessons/equities/Lesson4_3";
import EqMultiStage from "@/components/lessons/equities/Lesson4_4";
import EqEarningsGrowth from "@/components/lessons/equities/Lesson4_5";
import EqPVGO from "@/components/lessons/equities/Lesson4_6";
import EqCaseLab from "@/components/lessons/equities/Lesson4_7";
import RRMeaning from "@/components/lessons/risk-and-return/Lesson5_1";
import RRMeasuring from "@/components/lessons/risk-and-return/Lesson5_2";
import RRDiversification from "@/components/lessons/risk-and-return/Lesson5_3";
import RRBeta from "@/components/lessons/risk-and-return/Lesson5_4";
import RREmpirical from "@/components/lessons/risk-and-return/Lesson5_5";
import RRPortfolioLab from "@/components/lessons/risk-and-return/Lesson5_6";
import PTWeights from "@/components/lessons/portfolio-theory/Lesson6_1";
import PTRisk from "@/components/lessons/portfolio-theory/Lesson6_2";
import PTDiversification from "@/components/lessons/portfolio-theory/Lesson6_3";
import PTFrontier from "@/components/lessons/portfolio-theory/Lesson6_4";
import PTTangency from "@/components/lessons/portfolio-theory/Lesson6_5";
import CAPMTangencyMarket from "@/components/lessons/the-capm-and-apt/Lesson7_1";
import CAPMSecurityMarketLine from "@/components/lessons/the-capm-and-apt/Lesson7_3";
import CAPMEstimatingBeta from "@/components/lessons/the-capm-and-apt/Lesson7_4";
import CAPMAptInPractice from "@/components/lessons/the-capm-and-apt/Lesson7_7";
import Lesson8_1 from "@/components/lessons/capital-budgeting/Lesson8_1";
import Lesson8_2 from "@/components/lessons/capital-budgeting/Lesson8_2";
import Lesson8_3 from "@/components/lessons/capital-budgeting/Lesson8_3";
import Lesson8_4 from "@/components/lessons/capital-budgeting/Lesson8_4";
import Lesson8_5 from "@/components/lessons/capital-budgeting/Lesson8_5";
import Lesson8_6 from "@/components/lessons/capital-budgeting/Lesson8_6";
import Lesson8_7 from "@/components/lessons/capital-budgeting/Lesson8_7";
import Lesson9_1 from "@/components/lessons/efficient-markets/Lesson9_1";
import Lesson9_2 from "@/components/lessons/efficient-markets/Lesson9_2";
import Lesson9_3 from "@/components/lessons/efficient-markets/Lesson9_3";
import Lesson9_4 from "@/components/lessons/efficient-markets/Lesson9_4";
import LessonIF_1_1 from "@/components/lessons/investment-foundations/LessonIF_1_1";

export type LessonComponentProps = Record<string, never>;

export const lessonRegistry: Record<
  string,
  ComponentType<LessonComponentProps>
> = {
  "what-is-finance-value-time-risk": Lesson1,
  "price-discovery-and-accounting-language": Lesson2,
  "corporate-and-personal-financial-systems": Lesson3,
  "time-risk-and-financial-principles": Lesson4,
  "finance-roadmap-and-personal-application": Lesson5,
  "present-value-cashflows-assets-npv": PVCashflowsNPV,
  "present-value-perpetuities-annuities-compounding": PVSpecialCashflows,
  "present-value-inflation-real-nominal": PVInflation,
  "present-value-cfo-decision-room": PVCFODecisionRoom,
  "fixed-income-bond-markets-cash-flows-discount-bonds": FIBondMarkets,
  "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds":
    FISpotRates,
  "fixed-income-law-one-price-arbitrage-duration-convexity":
    FIArbitrageDuration,
  "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization":
    FICreditRisk,
  "equity-what-does-owning-a-stock-mean": EqOwnership,
  "equity-why-does-a-stock-have-value-today": EqDDM,
  "equity-gordon-growth-model": EqGordon,
  "equity-multi-stage-growth-valuation": EqMultiStage,
  "equity-earnings-dividend-growth": EqEarningsGrowth,
  "equity-growth-opportunities-pvgo-pe": EqPVGO,
  "equity-valuation-case-lab": EqCaseLab,
  "risk-return-what-they-mean": RRMeaning,
  "risk-measuring-historical-return-volatility": RRMeasuring,
  "risk-covariance-correlation-diversification": RRDiversification,
  "risk-systematic-idiosyncratic-beta": RRBeta,
  "risk-empirical-properties-stock-returns": RREmpirical,
  "risk-portfolio-risk-lab": RRPortfolioLab,
  "portfolio-weights-returns": PTWeights,
  "portfolio-risk-covariance-correlation": PTRisk,
  "portfolio-diversification-many-assets": PTDiversification,
  "portfolio-efficient-frontier": PTFrontier,
  "portfolio-risk-free-tangency-sharpe": PTTangency,
  "capm-tangency-becomes-market-portfolio": CAPMTangencyMarket,
  "security-market-line": CAPMSecurityMarketLine,
  "capm-estimating-beta": CAPMEstimatingBeta,
  "capm-apt-in-practice": CAPMAptInPractice,
  "required-return-to-discount-rate": Lesson8_1,
  "determining-the-discount-rate": Lesson8_2,
  "when-risk-changes-over-time": Lesson8_3,
  "npv-rule": Lesson8_4,
  "irr-and-payback": Lesson8_5,
  "project-cash-flows": Lesson8_6,
  "sensitivity-and-scenario-analysis": Lesson8_7,
  "efficient-market-hypothesis": Lesson9_1,
  "active-vs-passive-investing": Lesson9_2,
  "anomalies-and-limits-to-arbitrage": Lesson9_3,
  "building-investment-philosophy": Lesson9_4,
  "if-1-1-how-an-investor-builds-a-philosophy": LessonIF_1_1,
};

export function getLessonComponent(
  slug: string,
): ComponentType<LessonComponentProps> | undefined {
  return lessonRegistry[slug];
}
