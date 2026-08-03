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
        {reduce ? (
          children
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
