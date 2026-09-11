import type { Metadata } from "next";
import WorkspaceStage from "@/components/studio/workspace/WorkspaceStage";

export const metadata: Metadata = {
  title: "Research · Studio — Investing Studio",
  description:
    "Read what each investment actually is and what it holds, from its own filings, and write down why it belongs in your plan.",
};

export default function ResearchPage() {
  return <WorkspaceStage stage="research" eyebrow="Research" />;
}
