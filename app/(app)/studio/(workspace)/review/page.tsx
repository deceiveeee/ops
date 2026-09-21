import type { Metadata } from "next";
import WorkspaceStage from "@/components/studio/workspace/WorkspaceStage";

export const metadata: Metadata = {
  title: "Review · Studio — Investing Studio",
  description:
    "Write the rules you will follow later, record where you stand against the plan, and download a copy of your work.",
};

export default function ReviewPage() {
  return <WorkspaceStage stage="review" eyebrow="Review" />;
}
