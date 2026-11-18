import type { Metadata } from "next";
import { CheckStep } from "@/components/studio/workspace/ConstructionSteps";

export const metadata: Metadata = {
  title: "Check the whole portfolio · Studio — Investing Studio",
  description: "Step 7 of 9: look inside every fund, add up the costs, and hold the portfolio against a benchmark and your limits.",
};

export default function PortfolioCheckPage() {
  return <CheckStep />;
}
