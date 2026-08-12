"use client";

import EquityRiskLessonHero from "./EquityRiskLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import ShareholderRiskJourney from "./ShareholderRiskJourney";
import { IF_3_1_SOURCE_BASIS } from "./shared";

export default function LessonIF_3_1() {
  return (
    <IFLessonLayout sourceBasis={IF_3_1_SOURCE_BASIS}>
      <EquityRiskLessonHero
        number="3.1"
        title="What Risk Means for a Shareholder"
        intro="Begin with uncertain outcomes and the shareholder's residual claim, then inspect the same stock through three different risk lenses."
        mission="Define equity risk, follow the shareholder claim, and build a three-lens risk map before measuring anything."
        action="Open the risk lenses"
        minutes="18–20 minutes"
        artifact="Three-Lens Risk Map"
      />
      <ShareholderRiskJourney />
    </IFLessonLayout>
  );
}
