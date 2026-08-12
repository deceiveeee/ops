"use client";

import BetaDriversJourney from "./BetaDriversJourney";
import EquityRiskLessonHero from "./EquityRiskLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import { IF_3_4_SOURCE_BASIS } from "./shared";

export default function LessonIF_3_4() {
  return (
    <IFLessonLayout sourceBasis={IF_3_4_SOURCE_BASIS}>
      <EquityRiskLessonHero
        number="3.4"
        title="What Makes Beta Rise or Fall"
        intro="Run one economic shock through customer demand, operating costs, debt payments, and the shareholder residual."
        mission="Explain how product cyclicality, operating leverage, and financial leverage can change predicted beta, other things held equal."
        action="Open the beta engine"
        minutes="18–22 minutes"
        artifact="Beta Driver Chain"
      />
      <BetaDriversJourney />
    </IFLessonLayout>
  );
}
