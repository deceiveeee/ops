import type { Metadata } from "next";
import WorkspaceStage from "@/components/studio/workspace/WorkspaceStage";

export const metadata: Metadata = {
  title: "Portfolio · Studio — Investing Studio",
  description: "Decide how much of your money each investment takes, and see the dollar amount behind every percentage.",
};

export default function PortfolioPage() {
  // No "Portfolio" label: the tabs directly above already say where this is.
  return <WorkspaceStage stage="build" />;
}
