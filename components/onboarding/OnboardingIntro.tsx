"use client";

import Button from "@/components/ui/Button";

export default function OnboardingIntro({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start px-6">
      <h1 className="font-display text-[44px] leading-[1.05] text-slate-50 md:text-[60px]">
        Let&apos;s find your starting point.
      </h1>
      <div className="mt-10">
        <Button size="lg" onClick={onBegin}>
          Begin
        </Button>
      </div>
    </div>
  );
}
