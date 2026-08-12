"use client";

import BondLessonHero from "./BondLessonHero";
import DefaultRiskJourney from "./DefaultRiskJourney";
import IFLessonLayout from "./IFLessonLayout";
import { IF_2_4_SOURCE_BASIS } from "./shared";

export default function LessonIF_2_4() {
  return (
    <IFLessonLayout sourceBasis={IF_2_4_SOURCE_BASIS}>
      <BondLessonHero
        number="2.4"
        title="Default Risk: Can the Issuer Deliver?"
        intro="The contract states the payments. Credit analysis studies whether the issuer’s operating cash can support those payments through changing business conditions."
        mission="Stress an issuer’s cash-flow machine, trace the three default-risk drivers, and build a credit-rating evidence file."
        action="Stress the issuer"
        minutes="18–20 minutes"
        artifact="One credit evidence file"
      />
      <DefaultRiskJourney />
    </IFLessonLayout>
  );
}
