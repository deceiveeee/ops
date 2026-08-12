"use client";

import FinancialStatementLessonHero from "./FinancialStatementLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import ProfitLeverageJourney from "./ProfitLeverageJourney";
import { IF_4_4_SOURCE_BASIS } from "./shared";

export default function LessonIF_4_4() {
  return (
    <IFLessonLayout sourceBasis={IF_4_4_SOURCE_BASIS}>
      <FinancialStatementLessonHero
        number="4.4"
        title="Read Profit and Leverage"
        intro="Run revenue through the income engine, then build ratios whose numerators and denominators answer a clearly stated investor question."
        mission="Calculate Cedar Works' margins, ROE, debt to capital, and interest coverage, then explain the gap between operating and net profit."
        action="Run the income engine"
        minutes="24–28 minutes"
        artifact="Profit and Leverage Lens"
      />
      <ProfitLeverageJourney />
    </IFLessonLayout>
  );
}
