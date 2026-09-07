import { Suspense } from "react";
import type { Metadata } from "next";
import StudioWorkspace from "@/components/studio/StudioWorkspace";

export const metadata: Metadata = {
  title: "Studio — Open Portfolio Studio",
  description:
    "Build a portfolio you can explain: set a goal, research real investments from their own filings, set weights, check risk and cost, and write the rules you will follow.",
};

/**
 * The open destination is read from the URL, and `useSearchParams` opts a page
 * out of prerendering unless the boundary is explicit. The fallback is the same
 * skeleton the workspace shows while its own storage loads, so the shape of the
 * page never jumps between the two waits.
 */
function WorkspaceSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-st-side" />
      <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-st-paper" />
      <div className="mt-10 h-64 animate-pulse rounded-2xl bg-st-side" />
    </div>
  );
}

export default function StudioPage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative">
        <Suspense fallback={<WorkspaceSkeleton />}>
          <StudioWorkspace />
        </Suspense>
      </div>
    </div>
  );
}
