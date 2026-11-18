"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Steps 3 to 8 of the nine, in the order professionals build a portfolio:
 * the mix, the split inside each slice, a fund for each part, any picks, a
 * check of the whole, then carrying it out. Steps 1 and 2 are on Goals and
 * step 9 is Review. Pages a step links to (detailed scenarios, compared
 * allocations, return history, a bond's dates) keep that step's tab current.
 *
 * Links wrap on tablets. A disclosure keeps every destination reachable on a
 * phone while leaving room for the portfolio's controls and results.
 */
const TABS = [
  { href: "/studio/portfolio", label: "3. Your mix", covers: [] as string[] },
  { href: "/studio/portfolio/split", label: "4. Split each slice", covers: [] },
  { href: "/studio/portfolio/fill", label: "5. Fill each part", covers: [] },
  { href: "/studio/portfolio/picks", label: "6. Your picks", covers: [] },
  { href: "/studio/portfolio/check", label: "7. Check it", covers: ["/studio/portfolio/risk", "/studio/portfolio/weights", "/studio/portfolio/returns"] },
  { href: "/studio/portfolio/buying", label: "8. Carry it out", covers: ["/studio/portfolio/bond"] },
];
const isCurrent = (tab: (typeof TABS)[number], pathname: string) => pathname === tab.href || tab.covers.includes(pathname);

export default function PortfolioNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="Portfolio steps" className="mb-4">
      <details className="group rounded-lg border border-[var(--ops-control-border)] bg-[var(--ops-surface)] px-3 text-[13px] sm:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
          {TABS.find((tab) => isCurrent(tab, pathname))?.label ?? "Portfolio steps"}
          <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-[var(--ops-text-tertiary)] transition-transform group-open:rotate-180">
            <path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <ul className="border-t border-[var(--ops-divider)] pb-2">{TABS.map((tab) => <li key={tab.href}><Link href={tab.href} aria-current={pathname === tab.href ? "page" : isCurrent(tab, pathname) ? "true" : undefined} className="flex min-h-11 items-center" onClick={(event) => { const disclosure = event.currentTarget.closest("details"); if (disclosure) disclosure.open = false; }}>{tab.label}</Link></li>)}</ul>
      </details>
      <ul className="hidden gap-x-4 sm:flex sm:flex-wrap sm:gap-x-6 sm:border-b sm:border-[var(--ops-divider)]">
        {TABS.map((tab) => {
          const active = isCurrent(tab, pathname);
          return (
            <li key={tab.href} className="flex border-b border-[var(--ops-divider)] sm:block sm:border-0">
              <Link
                href={tab.href}
                aria-current={pathname === tab.href ? "page" : active ? "true" : undefined}
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
