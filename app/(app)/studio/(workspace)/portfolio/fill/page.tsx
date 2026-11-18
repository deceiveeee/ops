import type { Metadata } from "next";
import { FillStep } from "@/components/studio/workspace/ConstructionSteps";

export const metadata: Metadata = {
  title: "Fill each part · Studio — Investing Studio",
  description: "Step 5 of 9: choose one broad fund for each part, and see what each costs a year.",
};

export default function PortfolioFillPage() {
  return <FillStep />;
}
