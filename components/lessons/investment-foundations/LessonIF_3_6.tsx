"use client";

import EquityRiskLessonHero from "./EquityRiskLessonHero";
import EquityRiskPolicyJourney from "./EquityRiskPolicyJourney";
import IFLessonLayout from "./IFLessonLayout";
import { IF_3_6_SOURCE_BASIS } from "./shared";

export default function LessonIF_3_6() {
  return (
    <IFLessonLayout sourceBasis={IF_3_6_SOURCE_BASIS}>
      <EquityRiskLessonHero
        number="3.6"
        title="Build an Equity Risk Policy"
        intro="Turn risk definitions, model evidence, cash-flow judgment, and a price buffer into a decision the scholarship committee can audit."
        mission="Calculate the source-verified 8% implied return and $44 purchase threshold, then save a complete Equity Risk Policy."
        action="Build the policy"
        minutes="24–28 minutes"
        artifact="Final Equity Risk Policy"
      />
      <EquityRiskPolicyJourney />
    </IFLessonLayout>
  );
}
