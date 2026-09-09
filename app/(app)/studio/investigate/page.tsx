import { Suspense } from "react";
import type { Metadata } from "next";
import InvestigateView from "@/components/studio/InvestigateView";

export const metadata: Metadata = {
  title: "Investigate a company — Open Portfolio Studio",
  description:
    "Look up seven figures for a company you care about and find out whether it earns more than its capital costs, how it earns it, and what a single year cannot tell you.",
};

export default function InvestigatePage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* A filing hands a company over in the address, and reading the address
            opts a page out of prerendering unless the boundary is explicit. */}
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-st-side" />}>
          <InvestigateView />
        </Suspense>
      </div>
    </div>
  );
}
