"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The three parts of Portfolio, which were steps 3 to 5 of the old form.
 *
 * They wrap onto a second line on a narrow screen rather than scrolling
 * sideways: a tab that sits past the edge is one the learner never finds.
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
      <ul className="flex flex-wrap gap-x-6 border-b border-[var(--ops-divider)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex min-h-11 items-center whitespace-nowrap border-b-2 text-[14px] transition-colors",
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
