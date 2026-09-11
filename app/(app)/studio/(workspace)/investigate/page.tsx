import type { Metadata } from "next";
import InvestigateView from "@/components/studio/InvestigateView";

export const metadata: Metadata = {
  title: "Investigate a company — Investing Studio",
  description:
    "Look up seven figures for a company you care about and find out whether it earns more than its capital costs, how it earns it, and what a single year cannot tell you.",
};

export default function InvestigatePage() {
  return <InvestigateView />;
}
