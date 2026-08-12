"use client";

import DiversificationRiskJourney from "./DiversificationRiskJourney";
import EquityRiskLessonHero from "./EquityRiskLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import { IF_3_2_SOURCE_BASIS } from "./shared";

export default function LessonIF_3_2() {
  return (
    <IFLessonLayout sourceBasis={IF_3_2_SOURCE_BASIS}>
      <EquityRiskLessonHero
        number="3.2"
        title="Why Diversification Changes the Question"
        intro="Map return uncertainty, build a portfolio constellation, and see which shocks diversification can—and cannot—soften."
        mission="Separate company-specific risk from market risk and explain why a diversified price-setting investor changes the risk question."
        action="Build the portfolio"
        minutes="18–22 minutes"
        artifact="Portfolio Risk Diagnosis"
      />
      <DiversificationRiskJourney />
    </IFLessonLayout>
  );
}
