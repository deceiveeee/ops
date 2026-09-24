import type { Metadata } from "next";
import DecideView from "@/components/studio/DecideView";

export const metadata: Metadata = {
  title: "Decide: own it or turn it down — Investing Studio",
  description:
    "Look back over what your research found about a company, then add it to your portfolio or turn it down with your reason.",
};

export default function DecidePage() {
  return <DecideView />;
}
