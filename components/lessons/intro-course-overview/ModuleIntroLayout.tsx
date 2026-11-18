import LessonProgressRail from "./LessonProgressRail";
import SourceBasisPanel from "./SourceBasisPanel";

/**
 * The lesson comes first in the page and the module's lesson list and source
 * card second. From 1024px the list is placed in a left column beside the
 * lesson; below that it follows the lesson.
 *
 * It used to come first in both, which on a phone put 0.88 screens of lesson
 * list and source card above the lesson's own title (measured at 375x812,
 * title at 1.29 screens). `e2e/lesson-first-tap.spec.ts` holds this order.
 */
export default function ModuleIntroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-4 sm:px-8 sm:pb-16 sm:pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">{children}</div>
          <aside
            id="module-lessons"
            className="scroll-mt-24 space-y-4 lg:sticky lg:top-24 lg:col-start-1 lg:row-start-1 lg:self-start"
          >
            <LessonProgressRail />
            <SourceBasisPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
