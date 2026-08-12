"use client";

import BondLessonHero from "./BondLessonHero";
import DurationJourney from "./DurationJourney";
import IFLessonLayout from "./IFLessonLayout";
import { IF_2_3_SOURCE_BASIS } from "./shared";

export default function LessonIF_2_3() {
  return (
    <IFLessonLayout sourceBasis={IF_2_3_SOURCE_BASIS}>
      <BondLessonHero
        number="2.3"
        title="Duration: Measuring Interest-Rate Sensitivity"
        intro="Duration turns a complete bond payment timeline into a measure of when its present value arrives—and a way to compare rate exposure."
        mission="Locate the cash-flow center, rebuild the 8.36-year source example, test coupon and maturity, and rank four bonds by duration."
        action="Find the cash-flow center"
        minutes="18–22 minutes"
        artifact="One duration profile"
      />
      <DurationJourney />
    </IFLessonLayout>
  );
}
