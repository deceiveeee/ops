import type { Metadata } from "next";
import IndustryMapView from "@/components/studio/IndustryMapView";

export const metadata: Metadata = {
  title: "The map around it — Investing Studio",
  description:
    "Draw the industry map around a company: who supplies it, who buys from it, who it competes with, and what reaches them all.",
};

export default function MapPage() {
  return <IndustryMapView />;
}
