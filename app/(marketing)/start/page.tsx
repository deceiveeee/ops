import { Suspense } from "react";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export const metadata = {
  title: "Find your starting point — Open Portfolio Studio",
};

export default function StartPage({
  searchParams,
}: {
  searchParams: { retake?: string };
}) {
  const retake = searchParams.retake === "1";
  return (
    <Suspense fallback={null}>
      <OnboardingFlow retake={retake} />
    </Suspense>
  );
}
