"use client";

import BondLessonHero from "./BondLessonHero";
import IFLessonLayout from "./IFLessonLayout";
import RateRiskJourney from "./RateRiskJourney";
import { IF_2_2_SOURCE_BASIS } from "./shared";

export default function LessonIF_2_2() {
  return (
    <IFLessonLayout sourceBasis={IF_2_2_SOURCE_BASIS}>
      <BondLessonHero
        number="2.2"
        title="Why Market Rates Change Bond Prices"
        intro="A bond’s promised dollars can stay fixed while their market value changes. Reprice the same cash flows as the return available in the market moves."
        mission="Use present value to connect a market-yield change to bond price, price position, and a one-year investor return."
        action="Open the pricing lab"
        minutes="18–20 minutes"
        artifact="One rate-risk record"
      />
      <RateRiskJourney />
    </IFLessonLayout>
  );
}
