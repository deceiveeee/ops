import type { Metadata } from "next";
import IndustryView from "@/components/studio/IndustryView";

export const metadata: Metadata = {
  title: "Industry — Open Portfolio Studio",
  description:
    "Look at an industry before you look at a company: who competes in it, how the revenue is split between them, and how much of that split has moved in five years.",
};

export default function IndustryPage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <IndustryView />
      </div>
    </div>
  );
}
