"use client";

import BalanceSheetJourney from "./BalanceSheetJourney";
import FinancialStatementLessonHero from "./FinancialStatementLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import { IF_4_2_SOURCE_BASIS } from "./shared";

export default function LessonIF_4_2() {
  return (
    <IFLessonLayout sourceBasis={IF_4_2_SOURCE_BASIS}>
      <FinancialStatementLessonHero
        number="4.2"
        title="Read the Balance Sheet"
        intro="X-ray Cedar Works' $250m of assets, identify every claim funding them, and inspect the measurement rule behind each reported amount."
        mission="Prove the accounting equation, classify the lines, and separate book carrying amounts from current economic value."
        action="Start the X-ray"
        minutes="22–26 minutes"
        artifact="Balance-Sheet X-ray"
      />
      <BalanceSheetJourney />
    </IFLessonLayout>
  );
}
