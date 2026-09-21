import type { Metadata } from "next";
import WorkspaceStage from "@/components/studio/workspace/WorkspaceStage";

export const metadata: Metadata = {
  title: "Risk and cost · Studio — Investing Studio",
  description:
    "Try a fall in prices you choose, see what it would cost your portfolio, and see what the funds you hold charge each year.",
};

export default function PortfolioRiskPage() {
  // No "Portfolio" label: the tabs directly above already say where this is.
  return <WorkspaceStage stage="risk" />;
}
