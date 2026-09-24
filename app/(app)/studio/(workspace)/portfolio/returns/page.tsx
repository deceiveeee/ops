import type { Metadata } from "next";
import ReturnHistoryWorkspace from "@/components/studio/workspace/ReturnHistoryWorkspace";
export const metadata: Metadata = { title: "Return history · Studio", description: "Inspect public fund total returns and import local histories that include distributions and splits." };
export default function ReturnHistoryPage() { return <ReturnHistoryWorkspace />; }
