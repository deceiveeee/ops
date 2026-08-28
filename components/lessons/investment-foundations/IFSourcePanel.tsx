import { IF_SOURCE_BASIS, type IFSourceBasis } from "./shared";

export default function IFSourcePanel({
  sourceBasis = IF_SOURCE_BASIS,
}: {
  sourceBasis?: IFSourceBasis;
}) {
  return (
    <aside
      aria-label="Source basis"
      className="glass-panel relative overflow-hidden p-5 sm:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-amber/10 blur-2xl" />
      <div className="ops-eyebrow flex items-center gap-2 text-[12px] text-slate-400">
        <span className="h-px w-6 bg-accent-amber/50" />
        Source Basis
      </div>
      <div className="mt-3.5 space-y-1.5">
        {/* The course name is this panel's title; "Source Basis" above it is an
            eyebrow. Marking it as a heading is what makes that relationship
            true for a screen reader as well as to the eye. */}
        <h2 className="text-[15px] font-semibold text-white">
          {sourceBasis.course}
        </h2>
        <div className="ops-body text-[14px] text-slate-300">
          {sourceBasis.lecture}
        </div>
        <div className="font-sans text-[14px] text-accent-amber">
          {sourceBasis.instructor}
        </div>
      </div>
      {/*
       * Attribution stays visible; the reconciliation note does not.
       *
       * The note is where a mission records which sessions it drew on, what it
       * deliberately narrowed, and which claims it declined to make. That is
       * required traceability, but it is reference, not the task: the longest
       * run to about 2,500 characters, and rendering that as a wall under the
       * instructor's name reads as required reading before the lesson starts.
       * A learner who does not open it loses nothing they were meant to act on,
       * and the Screen Budget Rule puts context panels beside the work or behind
       * a disclosure. Nothing is removed — it is one click away and still in the
       * accessibility tree.
       */}
      <details className="group mt-3 border-t border-white/10 pt-1">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[12px] font-semibold text-slate-300 hover:text-white">
          <span>How this lesson uses them</span>
          <span className="text-[12px] font-normal text-slate-400 group-open:hidden">
            Show
          </span>
          <span className="hidden text-[12px] font-normal text-slate-400 group-open:inline">
            Hide
          </span>
        </summary>
        <p className="ops-muted pb-1 text-[12px]">{sourceBasis.note}</p>
      </details>
    </aside>
  );
}
