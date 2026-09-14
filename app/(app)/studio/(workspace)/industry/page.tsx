import type { Metadata } from "next";
import IndustryView from "@/components/studio/IndustryView";

export const metadata: Metadata = {
  title: "Industry — Investing Studio",
  description:
    "Look at an industry before you look at a company: who competes in it, how the revenue is split between them, and how much of that split has moved in five years.",
};

/** `?set=atkore` opens on a peer set, which is where Investigate's note about Atkore's industry sends a learner. */
export default async function IndustryPage({ searchParams }: { searchParams: Promise<{ set?: string }> }) {
  const { set } = await searchParams;
  return <IndustryView initialSet={set ?? null} />;
}
