"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { routeTheme } from "@/lib/route-theme";
import { cn } from "@/lib/utils";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const theme = routeTheme(pathname);
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "site-shell",
        theme === "light" ? "ops-theme-light" : "site-shell-dark",
      )}
    >
      <SiteHeader />
      <main className="site-main">
        {/*
          The wrapper is rendered unconditionally and only its *animation* is
          reduced. Branching the DOM on `useReducedMotion()` breaks hydration:
          the hook returns null on the server, so SSR always emitted this div
          while a client with `prefers-reduced-motion: reduce` did not expect
          it — "Did not expect server HTML to contain a <div> in <div>" — and
          React discarded the server markup and re-rendered the whole root.
          Measured on /, /courses, /courses/[slug] and /lessons/[slug]: every
          route mismatched under reduce and none did without it.
        */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  );
}
