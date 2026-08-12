"use client";

import BetaRiskJourney from "./BetaRiskJourney";
import EquityRiskLessonHero from "./EquityRiskLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import { IF_3_3_SOURCE_BASIS } from "./shared";

export default function LessonIF_3_3() {
  return (
    <IFLessonLayout sourceBasis={IF_3_3_SOURCE_BASIS}>
      <EquityRiskLessonHero
        number="3.3"
        title="What Beta Measures"
        intro="Build CAPM, test beta against positive and negative market moves, and inspect the uncertainty inside a historical regression estimate."
        mission="Interpret beta as estimated market exposure for a diversified investor without confusing it with total risk or investment quality."
        action="Build CAPM"
        minutes="22–25 minutes"
        artifact="Qualified Beta Reading"
      />
      <BetaRiskJourney />
    </IFLessonLayout>
  );
}
