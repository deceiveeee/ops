"use client";

import FinancialStatementLessonHero from "./FinancialStatementLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import ThreeStatementsJourney from "./ThreeStatementsJourney";
import { IF_4_1_SOURCE_BASIS } from "./shared";

export default function LessonIF_4_1() {
  return (
    <IFLessonLayout sourceBasis={IF_4_1_SOURCE_BASIS}>
      <FinancialStatementLessonHero
        number="4.1"
        title="The Three Financial Statements"
        intro="Open one annual report as three connected views: the year-end position, the year's profit, and the cash that actually moved."
        mission="Trace a credit sale through all three statements and file a Three-Statement Evidence Map before reading a single ratio."
        action="Open the filing"
        minutes="18–22 minutes"
        artifact="Three-Statement Evidence Map"
      />
      <ThreeStatementsJourney />
    </IFLessonLayout>
  );
}
