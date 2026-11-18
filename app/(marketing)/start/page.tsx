import { Suspense } from "react";
import StartGuide from "@/components/onboarding/StartGuide";
import { firstSteps } from "@/lib/learning-path";

export const metadata = {
  title: "Find where to start — Investing Studio",
  description: "Two questions, then your first lesson and how the site's courses, Studio and daily puzzle fit together.",
};

export default function StartPage({ searchParams }: { searchParams: { retake?: string } }) {
  return (
    <Suspense fallback={null}>
      <StartGuide steps={firstSteps()} retake={searchParams.retake === "1"} />
    </Suspense>
  );
}
