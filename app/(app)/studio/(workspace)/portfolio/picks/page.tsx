import type { Metadata } from "next";
import { PicksStep } from "@/components/studio/workspace/ConstructionSteps";

export const metadata: Metadata = {
  title: "Your picks · Studio — Investing Studio",
  description: "Step 6 of 9: set a budget for single companies, size each one inside it, and see the index money it replaces.",
};

export default function PortfolioPicksPage() {
  return <PicksStep />;
}
