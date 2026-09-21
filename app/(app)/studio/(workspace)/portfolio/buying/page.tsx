import type { Metadata } from "next";
import WorkspaceStage from "@/components/studio/workspace/WorkspaceStage";

export const metadata: Metadata = {
  title: "What to buy · Studio — Investing Studio",
  description:
    "Enter the price your broker shows and turn your dollar targets into quantities, with what stays in cash. Nothing places an order.",
};

export default function PortfolioBuyingPage() {
  // No "Portfolio" label: the tabs directly above already say where this is.
  return <WorkspaceStage stage="buy" />;
}
