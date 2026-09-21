import type { Metadata } from "next";
import WorkspaceStage from "@/components/studio/workspace/WorkspaceStage";

export const metadata: Metadata = {
  title: "Goals · Studio — Investing Studio",
  description:
    "Say what the money is for, when you expect to use it, how much you have, and the loss you could live with.",
};

export default function GoalsPage() {
  return <WorkspaceStage stage="goal" eyebrow="Goals" />;
}
