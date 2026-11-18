import type { Metadata } from "next";
import { SplitStep } from "@/components/studio/workspace/ConstructionSteps";

export const metadata: Metadata = {
  title: "Split each slice · Studio — Investing Studio",
  description: "Step 4 of 9: split Grow between US and international stocks, and Steady between short-term and longer-term bonds.",
};

export default function PortfolioSplitPage() {
  return <SplitStep />;
}
