import type { Metadata } from "next";
import BondView from "@/components/studio/BondView";

export const metadata: Metadata = {
  title: "A bond, day by day · Studio — Investing Studio",
  description:
    "Work out what an individual bond costs on the day you settle: the price, the interest built up since the last payment, and what it pays afterwards.",
};

export default function PortfolioBondPage() {
  return <BondView />;
}
