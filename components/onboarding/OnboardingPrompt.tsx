"use client";

import Button from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding/store";
import { useSession } from "@/lib/supabase/session";

export default function OnboardingPrompt() {
  const { user } = useSession();
  const { ready, isComplete, snapshot, dismissPrompt } = useOnboarding();

  if (!user) return null;
  if (!ready) return null;
  if (isComplete) return null;
  if (snapshot?.prompt_dismissed) return null;

  return (
    <div className="border-b border-accent-cyan/20 bg-accent-cyan/[0.06]">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[14px] text-slate-200">
          Tell us your goal and we&apos;ll find your starting point.
        </p>
        <div className="flex items-center gap-4">
          <Button href="/start" size="sm">
            Take the 60-second starting point
          </Button>
          <button
            type="button"
            onClick={dismissPrompt}
            aria-label="Dismiss"
            className="rounded text-[14px] text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
