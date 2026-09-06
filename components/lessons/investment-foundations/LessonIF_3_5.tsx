"use client";

import EquityRiskLessonHero from "./EquityRiskLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import RiskMeasureJourney from "./RiskMeasureJourney";
import { IF_3_5_SOURCE_BASIS } from "./shared";

export default function LessonIF_3_5() {
  return (
    <IFLessonLayout sourceBasis={IF_3_5_SOURCE_BASIS}>
      <EquityRiskLessonHero
        number="3.5"
        title="Choosing a Risk Measure"
        intro="Challenge CAPM at its boundaries, compare competing risk methods, and choose a method because it fits the investor's question."
        mission="Match theory, accounting, proxy, market-implied, cash-flow, and margin-of-safety approaches to the decisions they can support."
        action="Compare the methods"
        minutes="22–25 minutes"
        artifact="Two chosen risk methods"
      />
      <RiskMeasureJourney />
    </IFLessonLayout>
  );
}
