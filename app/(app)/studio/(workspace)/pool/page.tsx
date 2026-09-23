import type { Metadata } from "next";
import ProfitPoolView from "@/components/studio/ProfitPoolView";

export const metadata: Metadata = {
  title: "Where the money is made — Investing Studio",
  description:
    "The profit pool for an industry: which companies earn more than their capital costs, and how much of the industry's capital each one uses.",
};

export default function PoolPage() {
  return <ProfitPoolView />;
}
