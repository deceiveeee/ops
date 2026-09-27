import type { Metadata } from "next";
import PortfolioWeightsWorkspace from "@/components/studio/workspace/PortfolioWeightsWorkspace";

export const metadata: Metadata = { title: "Compare allocations · Studio", description: "Compare allocations, check your limits, and keep the valuation behind each holding." };
export default function PortfolioWeightsPage() { return <PortfolioWeightsWorkspace />; }
