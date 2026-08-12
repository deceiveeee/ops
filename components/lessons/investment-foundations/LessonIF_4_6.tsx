"use client";

import CashFlowInvestorJourney from "./CashFlowInvestorJourney";
import FinancialStatementLessonHero from "./FinancialStatementLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import { IF_4_6_SOURCE_BASIS } from "./shared";

export default function LessonIF_4_6() {
  return (
    <IFLessonLayout sourceBasis={IF_4_6_SOURCE_BASIS}>
      <FinancialStatementLessonHero
        number="4.6"
        title="Trace Cash to the Investor"
        intro="Scan every operating, investing, and financing cash movement, then change perspective from the company cash balance to equity and whole-firm cash flow."
        mission="Reconcile the $5m cash increase, build $27m FCFE and $28m FCFF, pass five corrected source concepts, and save the final brief."
        action="Start the cash scan"
        minutes="28–32 minutes"
        artifact="Investor Statement Brief"
      />
      <CashFlowInvestorJourney />
    </IFLessonLayout>
  );
}
