"use client";

import { cn } from "@/lib/utils";

export default function ProgressScanLine({ filled }: { filled: number }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-40 px-6">
      <div className="mx-auto mt-4 flex max-w-2xl gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-[2px] flex-1 rounded-full transition-colors duration-300",
              i < filled ? "bg-accent-cyan" : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}
