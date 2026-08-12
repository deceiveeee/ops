"use client";

import BondDecisionJourney from "./BondDecisionJourney";
import BondLessonHero from "./BondLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import { IF_2_5_SOURCE_BASIS } from "./shared";

export default function LessonIF_2_5() {
  return (
    <IFLessonLayout sourceBasis={IF_2_5_SOURCE_BASIS}>
      <BondLessonHero
        number="2.5"
        title="From Credit Rating to Bond Price"
        intro="Default evidence changes the return investors demand. That required yield flows directly into the price they will pay for the bond."
        mission="Build a required yield, price the source assessment bond, calculate interest coverage, apply a dated rating table, and deliver a Bond Risk Brief."
        action="Build the required yield"
        minutes="20–24 minutes"
        artifact="Final Bond Risk Brief"
      />
      <BondDecisionJourney />
    </IFLessonLayout>
  );
}
