"use client";

import BondLessonHero from "./BondLessonHero";
import BondPromiseJourney from "./BondPromiseJourney";
import IFLessonLayout from "./IFLessonLayout";
import { IF_2_1_SOURCE_BASIS } from "./shared";

export default function LessonIF_2_1() {
  return (
    <IFLessonLayout sourceBasis={IF_2_1_SOURCE_BASIS}>
      <BondLessonHero
        number="2.1"
        title="Reading a Bond’s Promise"
        intro="Before measuring bond risk, decode the payments the issuer has promised and the dates when the scholarship fund expects to receive them."
        mission="Inspect a conventional fixed-rate bond, build its ten-year payment timeline, and identify the two risks emphasized in this source session."
        action="Decode the bond"
        minutes="15–18 minutes"
        artifact="One Bond Payment Map"
      />
      <BondPromiseJourney />
    </IFLessonLayout>
  );
}
