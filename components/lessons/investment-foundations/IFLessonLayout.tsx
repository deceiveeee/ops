import IFProgressRail from "./IFProgressRail";
import IFSourcePanel from "./IFSourcePanel";
import type { IFSourceBasis } from "./shared";

export default function IFLessonLayout({
  children,
  sourceBasis,
}: {
  children: React.ReactNode;
  sourceBasis?: IFSourceBasis;
}) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
          <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-24 lg:self-start">
            <IFProgressRail />
            <IFSourcePanel sourceBasis={sourceBasis} />
          </aside>
          <div className="order-1 min-w-0 lg:order-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
