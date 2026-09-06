import type { Metadata } from "next";
import PortfolioPlan from "@/components/plan/PortfolioPlan";

export const metadata: Metadata = {
  title: "Your portfolio plan — Open Portfolio Studio",
  description:
    "Every decision you have recorded across Investment Foundations, gathered into one portfolio plan.",
};

export default function PlanPage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative">
        <PortfolioPlan />
      </div>
    </div>
  );
}
