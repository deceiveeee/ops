import type { Metadata } from "next";
import { MixStep } from "@/components/studio/workspace/ConstructionSteps";

export const metadata: Metadata = {
  title: "Your mix · Studio — Investing Studio",
  description: "Step 3 of 9: choose how much goes to Ready, Steady and Grow, and see whether that mix can reach your goal.",
};

export default function PortfolioPage() {
  return <MixStep />;
}
