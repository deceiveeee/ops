import type { Metadata } from "next";
import OverviewView from "@/components/studio/workspace/OverviewView";

export const metadata: Metadata = {
  title: "Studio — Investing Studio",
  description:
    "Build a portfolio you can explain: say what the money is for, research real investments from their own filings, decide how much goes where, check risk and cost, and write the rules you will follow.",
};

/** The workspace's home: what you were working on, and a suggested next step. */
export default function StudioHomePage() {
  return <OverviewView />;
}
