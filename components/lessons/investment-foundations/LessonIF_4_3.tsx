"use client";

import FinancialBalanceSheetJourney from "./FinancialBalanceSheetJourney";
import FinancialStatementLessonHero from "./FinancialStatementLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import { IF_4_3_SOURCE_BASIS } from "./shared";

export default function LessonIF_4_3() {
  return (
    <IFLessonLayout sourceBasis={IF_4_3_SOURCE_BASIS}>
      <FinancialStatementLessonHero
        number="4.3"
        title="Recast the Business"
        intro="Change lenses from reported line items to assets in place, future growth, contractual claims, and the shareholder residual."
        mission="Build Damodaran's financial balance sheet while keeping every investor estimate distinct from reported accounting."
        action="Open the recast desk"
        minutes="20–24 minutes"
        artifact="Financial Balance-Sheet Map"
      />
      <FinancialBalanceSheetJourney />
    </IFLessonLayout>
  );
}
