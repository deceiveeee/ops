import type { Metadata } from "next";
import CompetitionView from "@/components/studio/CompetitionView";

export const metadata: Metadata = {
  title: "What competition does to this business — Investing Studio",
  description:
    "Read the five forces around a company you are investigating: what presses on the prices it charges, the costs it carries, the capital it needs and where it can put more money.",
};

export default function CompetitionPage() {
  return <CompetitionView />;
}
