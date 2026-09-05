import type { Metadata } from "next";
import StudioWorkspace from "@/components/studio/StudioWorkspace";

export const metadata: Metadata = {
  title: "Studio — Open Portfolio Studio",
  description:
    "Build a portfolio you can explain: set a goal, research real investments from their own filings, set weights, check risk and cost, and write the rules you will follow.",
};

export default function StudioPage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative">
        <StudioWorkspace />
      </div>
    </div>
  );
}
