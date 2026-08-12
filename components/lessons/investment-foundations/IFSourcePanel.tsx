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
      <p className="ops-muted mt-3 text-[12px]">{sourceBasis.note}</p>
    </aside>
  );
}
