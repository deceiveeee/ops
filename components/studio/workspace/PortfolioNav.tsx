"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Allocation, risk, historical returns and the buying plan.
 *
 * Links wrap on tablets. A disclosure keeps every destination reachable on a
 * phone while leaving room for the portfolio's controls and results.
 */
const TABS = [
  { href: "/studio/portfolio", label: "How much goes where" },
  { href: "/studio/portfolio/weights", label: "Compare allocations" },
  { href: "/studio/portfolio/risk", label: "Risk and cost" },
  { href: "/studio/portfolio/returns", label: "Return history" },
  { href: "/studio/portfolio/buying", label: "What to buy" },
];

export default function PortfolioNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="Portfolio" className="mb-4">
      <details className="rounded-lg border border-[var(--ops-control-border)] bg-[var(--ops-surface)] px-3 text-[13px] sm:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between">{TABS.find((tab) => tab.href === pathname)?.label ?? "Portfolio pages"}<span aria-hidden="true">⌄</span></summary>
        <ul className="border-t border-[var(--ops-divider)] pb-2">{TABS.map((tab) => <li key={tab.href}><Link href={tab.href} aria-current={pathname === tab.href ? "page" : undefined} className="flex min-h-11 items-center" onClick={(event) => { const disclosure = event.currentTarget.closest("details"); if (disclosure) disclosure.open = false; }}>{tab.label}</Link></li>)}</ul>
      </details>
      <ul className="hidden gap-x-4 sm:flex sm:flex-wrap sm:gap-x-6 sm:border-b sm:border-[var(--ops-divider)]">
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
