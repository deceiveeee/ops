"use client";

import IFLessonLayout from "./IFLessonLayout";
import ValuationLessonHero from "./ValuationLessonHero";
import ValuationRangeJourney from "./ValuationRangeJourney";
import { IF_5_1_SOURCE_BASIS } from "./shared";

export default function LessonIF_5_1() {
  return (
    <IFLessonLayout sourceBasis={IF_5_1_SOURCE_BASIS}>
      <ValuationLessonHero />
      <ValuationRangeJourney />
    </IFLessonLayout>
  );
}
