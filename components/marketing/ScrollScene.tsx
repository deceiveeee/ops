"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  className?: string;
  stickyClassName?: string;
  children: React.ReactNode;
  /** Height of the scroll runway in viewport units. Higher = more scroll to traverse. */
  runway?: number;
};

/**
 * Sticky scroll-storytelling wrapper.
 * The section occupies `runway` vh of vertical scroll, while the visual
 * stays pinned in the center. Use the returned progress via children motion.
 */
export default function ScrollScene({ id, className, stickyClassName, children, runway = 200 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section
      id={id}
      ref={ref}
      className={cn("relative", className)}
      style={{ height: `${runway}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <SceneProgress progress={scrollYProgress} />
        <div className={cn("relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8", stickyClassName)}>
          {children}
        </div>
      </div>
    </section>
  );
}

function SceneProgress({ progress }: { progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const width = useTransform(progress, [0, 1], ["0%", "100%"]);
  return (
    <div className="absolute left-0 top-0 z-20 h-px w-full bg-white/5">
      <motion.div style={{ width }} className="h-px bg-gradient-to-r from-accent-cyan/0 via-accent-cyan to-accent-cyan/0" />
    </div>
  );
}
