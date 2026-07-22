"use client";

import HeroChapter from "@/components/marketing/HeroChapter";
import BusinessChapter from "@/components/marketing/BusinessChapter";
import FilingSourceChapter from "@/components/marketing/FilingSourceChapter";
import CashFlowValueChapter from "@/components/marketing/CashFlowValueChapter";
import PortfolioChapter from "@/components/marketing/PortfolioChapter";
import FinalCTAChapter from "@/components/marketing/FinalCTAChapter";

/**
 * Homepage — five cinematic chapters + final CTA.
 *
 *   1. Hero                 — Decode the market beneath the chart
 *   2. Business             — Behind every ticker is a business
 *   3. Source               — Start with the source (warm paper section)
 *   4. Cash flow → Value    — Cash flow becomes value (scroll-driven)
 *   5. Portfolio (+ Macro)  — Diversification + rate-shock absorption
 *   6. Final CTA            — Understand how it connects
 *
 * Each chapter is anchored by one flagship visual occupying 60–80% of
 * the available canvas. State changes are scroll-driven (no sliders,
 * no compact tab bars). Tonal rhythm: deep black → graphite → warm
 * paper → deep dark → teal → deep black. Headlines are pure white;
 * cyan is reserved for one focal visual element per chapter.
 */
export default function HomePage() {
  return (
    <>
      <HeroChapter />
      <BusinessChapter />
      <FilingSourceChapter />
      <CashFlowValueChapter />
      <PortfolioChapter />
      <FinalCTAChapter />
    </>
  );
}
