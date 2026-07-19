import { SOURCE_BASIS } from "./lessonContent";

export default function SourceBasisPanel() {
  return (
    <aside
      aria-label="Source basis"
      className="glass-panel relative overflow-hidden p-5 sm:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />
      <div className="ops-eyebrow flex items-center gap-2 text-[11px] text-slate-400">
        <span className="h-px w-6 bg-accent-cyan/50" />
        Source Basis
      </div>
      <div className="mt-3.5 space-y-1.5">
        <div className="text-[15px] font-semibold text-white">
          {SOURCE_BASIS.course}
        </div>
        <div className="ops-body text-[14px] text-slate-300">
          {SOURCE_BASIS.lecture}
        </div>
        <div className="font-mono text-[13px] text-accent-cyan">
          {SOURCE_BASIS.instructor}
        </div>
      </div>
      <p className="ops-muted mt-3 text-[13px]">{SOURCE_BASIS.note}</p>
    </aside>
  );
}
