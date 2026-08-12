"use client";

import AnalystAdjustmentsJourney from "./AnalystAdjustmentsJourney";
import FinancialStatementLessonHero from "./FinancialStatementLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import { IF_4_5_SOURCE_BASIS } from "./shared";

export default function LessonIF_4_5() {
  return (
    <IFLessonLayout sourceBasis={IF_4_5_SOURCE_BASIS}>
      <FinancialStatementLessonHero
        number="4.5"
        title="Repair the Investor View"
        intro="Put a date and reporting framework on every adjustment before turning lease promises and R&D spending into analytical assets and claims."
        mission="Avoid lease double counting, verify a $9.385m present value, and build a transparent five-year R&D capitalization model."
        action="Open the repair bench"
        minutes="26–30 minutes"
        artifact="Analyst Adjustment Memo"
      />
      <AnalystAdjustmentsJourney />
    </IFLessonLayout>
  );
}
