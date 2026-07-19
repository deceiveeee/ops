import PVProgressRail from "./PVProgressRail";
import PVSourceBasisPanel from "./PVSourceBasisPanel";

export default function PVLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <PVProgressRail />
            <PVSourceBasisPanel />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
