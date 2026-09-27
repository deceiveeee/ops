import type { Metadata } from "next";
import ValuationWorkspace from "@/components/studio/workspace/ValuationWorkspace";
export const metadata: Metadata = { title: "Valuation · Studio", description: "Estimate value under stated assumptions and keep your scenarios beside their sources." };
export default function ValuationPage() { return <ValuationWorkspace />; }
