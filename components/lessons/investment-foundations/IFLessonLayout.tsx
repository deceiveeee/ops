import IFProgressRail from "./IFProgressRail";
import IFSourcePanel from "./IFSourcePanel";
import type { IFSourceBasis } from "./shared";
import WorkbenchCompanion from "@/components/portfolio-workbench/WorkbenchCompanion";

export default function IFLessonLayout({
  children,
  sourceBasis,
}: {
  children: React.ReactNode;
  sourceBasis?: IFSourceBasis;
}) {
  /**
   * Workbench, progress and source basis. On desktop this is the left rail. On a
   * phone it has nowhere to sit beside the lesson, so it stacks underneath and
   * measured 781px — most of a screen of reference material between the learner
   * and the end of the page. It is reference, not the task, so on small screens
   * it collapses behind a summary (Screen Budget Rule in AGENTS.md).
   *
   * Rendered twice rather than toggled, so there is no client state and no
   * hydration mismatch: exactly one copy is ever displayed, and the hidden copy
   * is `display:none`, so it is out of the accessibility tree and out of the
   * typography gate's audit. The gate audits at desktop width, where this is the
   * expanded rail, so nothing loses coverage by collapsing on mobile.
   */
  const reference = (
    <>
      <WorkbenchCompanion compact />
      <IFProgressRail />
      <IFSourcePanel sourceBasis={sourceBasis} />
    </>
  );

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      {/* Deliberately still 7xl. Widening this to 1680px did give Mission 5 a
          wider working column, but it is the shared Investment Foundations
          layout: measured at 1920px it stretched body paragraphs to ~136
          characters a line, about double a readable measure. Mission 5 is
          cramped by its own nested sidebar, and that is where it is fixed. */}
      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
          {/*
           * The rail scrolls inside itself rather than growing the page.
           *
           * It lists every module, so it gets taller with each mission added:
           * at mission 10 it reached 1736px and overtook the lesson column,
           * which meant the course's own length — not the lesson — was setting
           * page height, and every future mission would make it worse. Capping
           * it to the viewport keeps the lesson column in control.
           */}
          <aside className="order-2 hidden lg:order-1 lg:block lg:self-start lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
            <div className="space-y-4">{reference}</div>
            {/* The cap above slices whatever card lands at the edge, which reads
                as a broken panel rather than a scrollable one. A sticky fade
                pinned to the scroll viewport says "there is more" in CSS alone.
                Uses --ops-bg, not a fixed ink token: these pages render under
                .ops-theme-light, where a dark fade paints a black bar. */}
            <div
              aria-hidden
              className="pointer-events-none sticky bottom-0 -mt-8 h-8"
              style={{
                backgroundImage:
                  "linear-gradient(to top, var(--ops-bg), transparent)",
              }}
            />
          </aside>

          <div className="order-1 min-w-0 space-y-8 lg:order-2">
            <div>{children}</div>

            <details className="group rounded-2xl border border-white/10 bg-white/[0.02] lg:hidden">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[13px] font-semibold text-slate-300">
                <span>Lesson reference</span>
                <span className="text-[12px] font-normal text-slate-400 group-open:hidden">
                  Progress, workbench and sources
                </span>
                <span className="hidden text-[12px] font-normal text-slate-400 group-open:inline">
                  Hide
                </span>
              </summary>
              <div className="space-y-4 px-4 pb-4">{reference}</div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
