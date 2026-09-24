"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The three parts of Portfolio, which were steps 3 to 5 of the old form.
 *
 * They wrap onto a second line on a narrow screen rather than scrolling
 * sideways: a tab that sits past the edge is one the learner never finds. On a
 * phone that is two rows of two, each on its own line, so the underline under
 * the first row does not float above nothing.
 */
const TABS = [
  { href: "/studio/portfolio", label: "How much goes where" },
  { href: "/studio/portfolio/risk", label: "Risk and cost" },
  { href: "/studio/portfolio/buying", label: "What to buy" },
];

export default function PortfolioNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="Portfolio" className="mb-4">
      <ul className="grid grid-cols-2 gap-x-4 sm:flex sm:flex-wrap sm:gap-x-6 sm:border-b sm:border-[var(--ops-divider)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="flex border-b border-[var(--ops-divider)] sm:block sm:border-0">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex min-h-11 w-full items-center border-b-2 py-1 text-[14px] leading-5 transition-colors sm:inline-flex sm:w-auto sm:whitespace-nowrap sm:py-0",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]",
                  active
                    ? "border-[var(--ops-accent-strong)] font-semibold text-[var(--ops-accent-strong)]"
                    : "border-transparent text-[var(--ops-text-secondary)] hover:text-[var(--ops-text-primary)]",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
