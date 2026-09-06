import type { ReactNode } from "react";

/**
 * Shared shell for the two legal pages.
 *
 * Quiet, readable, and deliberately plain: someone checking what happens to
 * their data should not have to work at it. Same typography as the rest of the
 * site, no terminal grid, generous line height.
 */
export function LegalPage({
  title,
  updated,
  summary,
  children,
}: {
  title: string;
  updated: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full">
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="ops-display text-3xl leading-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-[13px] text-slate-500">Last updated {updated}</p>
        <p className="mt-6 text-[15px] leading-7 text-slate-300">{summary}</p>
        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[17px] font-semibold text-white">{heading}</h2>
      <div className="mt-2 space-y-3 text-[14px] leading-7 text-slate-400">{children}</div>
    </section>
  );
}
