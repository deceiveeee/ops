"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STUDIO_GUIDANCE, type StudioGuidanceKey } from "@/lib/studio-guidance";
import type { StudioMode } from "@/lib/studio-project/schema";
import { GuidancePanel, Notice, Panel, Stat, downloadFile, pct, usdWhole } from "../shared";
import ProjectMenu from "./ProjectMenu";
import { WorkspaceProvider, useWorkspace } from "./WorkspaceProvider";

/**
 * The workspace's sections, in the order the work usually runs. The order is
 * only suggested: every section is one click away and none waits on another.
 */
export const SECTIONS = [
  // The home. Matched exactly, because every other section also starts with /studio.
  { key: "overview", label: "Overview", href: "/studio", covers: ["/studio"], exact: true },
  { key: "goals", label: "Goals", href: "/studio/goals", covers: ["/studio/goals"] },
  {
    key: "research",
    label: "Research",
    href: "/studio/research",
    covers: ["/studio/research", "/studio/investigate", "/studio/industry", "/studio/filings"],
  },
  { key: "portfolio", label: "Portfolio", href: "/studio/portfolio", covers: ["/studio/portfolio"] },
  { key: "review", label: "Review", href: "/studio/review", covers: ["/studio/review"] },
] as const;

type Section = (typeof SECTIONS)[number];

const within = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);
const sectionFor = (pathname: string): Section | undefined =>
  SECTIONS.find((section) =>
    "exact" in section && section.exact ? pathname === section.href : section.covers.some((base) => within(pathname, base)),
  );

/** Pages built from the old form's steps: the guide sits with them, and so does the portfolio total. */
const STAGE_PAGES = ["/studio/goals", "/studio/research", "/studio/portfolio", "/studio/review"];
/** Research tools with their own introductions, whose sources belong beside the work. */
const TOOL_PAGES = ["/studio/investigate", "/studio/industry", "/studio/filings"];

/** The explanation that belongs with each page's work. */
function guidanceFor(pathname: string): StudioGuidanceKey | null {
  if (within(pathname, "/studio/goals")) return "goal";
  if (within(pathname, "/studio/research") || TOOL_PAGES.some((base) => within(pathname, base))) return "research";
  if (within(pathname, "/studio/portfolio/risk")) return "risk";
  if (within(pathname, "/studio/portfolio/buying")) return "buy";
  if (within(pathname, "/studio/portfolio")) return "build";
  if (within(pathname, "/studio/review")) return "review";
  return null;
}

const MODES: { value: StudioMode; label: string }[] = [
  { value: "practice", label: "Practice" },
  { value: "personal", label: "Your own" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]";

export default function StudioFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  return (
    <WorkspaceProvider
      opening={
        <Layout
          pathname={pathname}
          bar={
            <div className="flex items-center gap-3">
              <SectionsMenu pathname={pathname} />
              <p role="status" className="text-[13px] text-[var(--ops-text-tertiary)]">Opening your work…</p>
            </div>
          }
        >
          <WorkWaiting />
        </Layout>
      }
    >
      <LiveFrame pathname={pathname}>{children}</LiveFrame>
    </WorkspaceProvider>
  );
}

function LiveFrame({ pathname, children }: { pathname: string; children: ReactNode }) {
  const { setAsideSlot } = useWorkspace();
  const guidance = guidanceFor(pathname);
  const stagePage = STAGE_PAGES.some((base) => within(pathname, base));
  const toolPage = TOOL_PAGES.some((base) => within(pathname, base));

  let aside: ReactNode = null;
  if (stagePage && guidance) {
    aside = (
      <div className="space-y-4">
        <GuidancePanel guidance={STUDIO_GUIDANCE[guidance]} />
        <Summary />
      </div>
    );
  } else if (toolPage) {
    aside = (
      <div className="space-y-4">
        {/* Filled by the page with where its numbers come from, beside the numbers. */}
        <div ref={setAsideSlot} className="space-y-4 empty:hidden" />
        {guidance ? <GuidancePanel guidance={STUDIO_GUIDANCE[guidance]} /> : null}
      </div>
    );
  }

  return (
    <Layout pathname={pathname} bar={<ProjectBar pathname={pathname} />} aside={aside}>
      <Problems />
      {/* Narrow screens keep the definition above the work, where a first-time
          learner meets it before the questions that use it. */}
      {stagePage && guidance ? (
        <div className="mb-5 space-y-4 xl:hidden">
          <Strip />
          <GuidancePanel guidance={STUDIO_GUIDANCE[guidance]} />
        </div>
      ) : null}
      {children}
    </Layout>
  );
}

function Layout({
  pathname, bar, aside, children,
}: { pathname: string; bar: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="studio-app mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
        <Sidebar pathname={pathname} />
        <div className="min-w-0">
          <div className="flex min-h-[3.25rem] flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[var(--ops-divider)] pb-4">
            {bar}
          </div>
          <div className={cn("mt-6", aside ? "xl:grid xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start xl:gap-8" : undefined)}>
            <div className="min-w-0">{children}</div>
            {/* Beside the work, never under it: a weight change is never made
                without its consequence on screen. */}
            {aside ? (
              <aside aria-label="About this page" className="hidden xl:sticky xl:top-[5.5rem] xl:block">
                {aside}
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLinks({ pathname }: { pathname: string }) {
  const current = sectionFor(pathname);
  return (
    <ul className="space-y-1">
      {SECTIONS.map((section) => {
        const active = current?.key === section.key;
        return (
          <li key={section.key}>
            <Link
              href={section.href}
              aria-current={active ? (pathname === section.href ? "page" : "true") : undefined}
              className={cn(
                "flex min-h-11 items-center rounded-lg px-3 text-[15px] font-medium transition-colors",
                focusRing,
                active
                  ? "bg-[var(--ops-accent-soft)] text-[var(--ops-accent-strong)]"
                  : "text-[var(--ops-text-secondary)] hover:bg-[var(--ops-surface-2)] hover:text-[var(--ops-text-primary)]",
              )}
            >
              {section.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-[5.5rem]">
        <nav aria-label="Studio sections">
          <p className="px-3 pb-2 text-[12px] font-medium text-[var(--ops-text-tertiary)]">Studio</p>
          <SectionLinks pathname={pathname} />
        </nav>
        <p className="mt-6 px-3 text-[12px] leading-5 text-[var(--ops-text-tertiary)]">
          Saved in this browser only. Educational planning, not investment advice. No orders are ever sent.
        </p>
      </div>
    </div>
  );
}

/** Below 1024px the sections move into a menu, labelled in words rather than an icon. */
function SectionsMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = sectionFor(pathname);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative lg:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--ops-control-border)] bg-[var(--ops-surface)] px-3 text-[14px]",
          focusRing,
        )}
      >
        <span className="text-[var(--ops-text-tertiary)]">Section</span>
        <span className="font-semibold text-[var(--ops-text-primary)]">{current?.label ?? "Studio"}</span>
        <svg aria-hidden="true" viewBox="0 0 12 12" className={cn("h-3 w-3 text-[var(--ops-text-tertiary)] transition-transform", open && "rotate-180")}>
          <path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <nav
          id={menuId}
          aria-label="Studio sections"
          className="absolute left-0 top-full z-30 mt-2 w-60 rounded-xl border border-[var(--ops-divider)] bg-[var(--ops-surface)] p-2 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]"
        >
          <SectionLinks pathname={pathname} />
        </nav>
      ) : null}
    </div>
  );
}

function ProjectBar({ pathname }: { pathname: string }) {
  const { project } = useWorkspace();
  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <SectionsMenu pathname={pathname} />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-6 text-[var(--ops-text-primary)]">
            {project?.name || "Your portfolio"}
          </p>
          <SaveState />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ProjectMenu />
        <ModeSwitch />
      </div>
    </>
  );
}

/** Honest about what storage has acknowledged. An edit on screen is not a save. */
function SaveState() {
  const { session, draft } = useWorkspace();
  const { status, dirty, externalChange } = session;
  let text = "";
  let tone: "quiet" | "warn" | "error" = "quiet";
  if (status === "loading") text = "Opening your work…";
  else if (status === "saving" || (status === "ready" && (dirty || draft))) text = "Saving…";
  else if (status === "ready") {
    text = externalChange ? "Saved here. Changed since in another tab." : "Saved in this browser";
    if (externalChange) tone = "warn";
  } else if (status === "unsaved") [text, tone] = ["Not saved. Your changes are still on this page.", "warn"];
  else if (status === "conflict") [text, tone] = ["Changed in another tab. This version is not saved.", "warn"];
  else if (status === "blocked") [text, tone] = ["Your saved work could not be read.", "error"];
  else if (status === "unavailable") [text, tone] = ["This browser is not saving your work.", "error"];
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "text-[13px] leading-5",
        tone === "quiet" && "text-[var(--ops-text-tertiary)]",
        tone === "warn" && "text-[var(--ops-warning-strong)]",
        tone === "error" && "text-[var(--ops-error-strong)]",
      )}
    >
      {text}
    </p>
  );
}

function ModeSwitch() {
  const { mode, switchMode } = useWorkspace();
  const hint = useId();
  return (
    <div className="flex items-center">
      <span id={hint} className="sr-only">
        Practice and your own portfolio are saved separately. Switching opens the other one.
      </span>
      <div
        role="group"
        aria-label="Which portfolio"
        aria-describedby={hint}
        className="inline-flex rounded-full border border-[var(--ops-divider)] bg-[var(--ops-surface-2)] p-1"
      >
        {MODES.map((option) => {
          const on = option.value === mode;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              onClick={() => switchMode(option.value)}
              className={cn(
                "min-h-10 rounded-full px-4 text-[14px] font-medium transition-colors [@media(pointer:coarse)]:min-h-11",
                focusRing,
                on
                  ? "bg-[var(--ops-surface)] text-[var(--ops-text-primary)] shadow-[0_1px_2px_rgb(0_0_0/0.14)]"
                  : "text-[var(--ops-text-secondary)] hover:text-[var(--ops-text-primary)]",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Problems with the save itself, above the work they affect, each with what can
 * be done about it. A draft is never thrown away without being offered first.
 */
function Problems() {
  const { session, error, project, report } = useWorkspace();
  const name = project?.name.trim() || "Studio portfolio";
  const downloadDraft = () => {
    const backup = session.exportBackup();
    if (!backup.ok) {
      report({ ok: false, code: "invalid", error: backup.error });
      return;
    }
    downloadFile(`${name}${backup.saved ? "" : " (unsaved draft)"}.json`, backup.raw, "application/json");
  };
  const notices: ReactNode[] = [];
  if (session.status === "blocked") {
    const original = session.recoveryRaw;
    notices.push(
      <Notice key="blocked" tone="red" title="Your saved work could not be read">
        {session.error} Nothing has been changed or deleted.
        {original ? (
          <Actions>
            <ActionButton onClick={() => downloadFile(`${name} (unreadable original).json`, original, "application/json")}>
              Download the original
            </ActionButton>
          </Actions>
        ) : null}
      </Notice>,
    );
  }
  if (session.status === "unavailable") {
    notices.push(
      <Notice key="unavailable" tone="red" title="This browser is not saving your work">
        {session.error ?? "Browser storage could not be opened."} Studio will not pretend to save. Allow this site to
        store data, then try again.
        <Actions>
          <ActionButton onClick={() => void session.reload()}>Try again</ActionButton>
        </Actions>
      </Notice>,
    );
  }
  if (session.status === "conflict") {
    notices.push(
      <Notice key="conflict" tone="amber" title="This portfolio changed in another tab">
        Your version on this page has not been saved. Keep a copy of it before loading the saved one, or carry on in
        the other tab.
        <Actions>
          <ActionButton onClick={downloadDraft}>Download this version</ActionButton>
          <ActionButton
            onClick={() => {
              if (window.confirm("Load the version saved in the other tab? Changes on this page that are not saved will be lost.")) {
                void session.reload(true);
              }
            }}
          >
            Load the saved version
          </ActionButton>
        </Actions>
      </Notice>,
    );
  } else if (session.status === "unsaved") {
    notices.push(
      <Notice key="unsaved" tone="amber" title="Your latest changes are not saved">
        {error ?? session.error ?? "Browser storage did not keep the last change."} They are still on this page.
        <Actions>
          <ActionButton onClick={() => void session.retry()}>Try saving again</ActionButton>
          <ActionButton onClick={downloadDraft}>Download them</ActionButton>
        </Actions>
      </Notice>,
    );
  } else if (error) {
    notices.push(
      <Notice key="error" tone="red" title="That change was not saved">
        {error}
      </Notice>,
    );
  }
  if (session.status === "ready" && session.externalChange && !session.dirty) {
    notices.push(
      <Notice key="newer" tone="slate" title="A newer version was saved in another tab">
        This page still shows the version it opened with.
        <Actions>
          <ActionButton onClick={() => void session.reload()}>Load the newer version</ActionButton>
        </Actions>
      </Notice>,
    );
  }
  return notices.length ? <div className="mb-5 space-y-3">{notices}</div> : null;
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2">{children}</div>;
}

function ActionButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center rounded-full border border-[var(--ops-control-border)] bg-[var(--ops-surface)] px-4 text-[14px] font-medium text-[var(--ops-text-primary)] hover:bg-[var(--ops-surface-2)] [@media(pointer:coarse)]:min-h-11",
        focusRing,
      )}
    >
      {children}
    </button>
  );
}

function Summary() {
  const { plan, calculation } = useWorkspace();
  if (!plan || !calculation) return null;
  const fullyAssigned = Math.abs(calculation.totalWeightPct - 100) <= 0.01;
  return (
    <Panel>
      <div className="ops-caption text-[11px] text-slate-500">Your portfolio</div>
      <div className="mt-3 space-y-3">
        <Stat label="To invest" value={usdWhole(calculation.investableBudget)} />
        <Stat
          label="Assigned"
          value={pct(calculation.totalWeightPct)}
          detail={fullyAssigned ? "Fully assigned" : "Needs to total 100%"}
        />
        <Stat label="Investments" value={String(plan.holdings.length)} />
        <Stat label="Held as cash" value={usdWhole(calculation.targetCash)} />
      </div>
      {calculation.issues.length > 0 ? (
        <ul className="mt-4 space-y-1 border-t border-white/10 pt-3">
          {calculation.issues.slice(0, 3).map((issue) => (
            <li key={issue} className="text-[13px] leading-5 text-accent-amber">
              {issue}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

/** The same three numbers as one line, for screens without room beside the work. */
function Strip() {
  const { plan, calculation } = useWorkspace();
  if (!plan || !calculation) return null;
  const fullyAssigned = Math.abs(calculation.totalWeightPct - 100) <= 0.01;
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px]">
      <span className="text-slate-500">
        To invest <span className="tabular-nums text-white">{usdWhole(calculation.investableBudget)}</span>
      </span>
      <span className="text-slate-500">
        Assigned{" "}
        <span className={cn("tabular-nums", fullyAssigned ? "text-accent-green" : "text-accent-amber")}>
          {pct(calculation.totalWeightPct)}
        </span>
      </span>
      <span className="text-slate-500">
        Investments <span className="tabular-nums text-white">{plan.holdings.length}</span>
      </span>
    </div>
  );
}

/** Placeholder shapes while the project opens. Nothing here is interactive. */
export function WorkWaiting() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="h-4 w-24 rounded bg-[var(--ops-surface-2)] motion-safe:animate-pulse" />
      <div className="h-8 w-72 max-w-full rounded-lg bg-[var(--ops-surface-2)] motion-safe:animate-pulse" />
      <div className="h-56 rounded-2xl bg-[var(--ops-surface-2)] motion-safe:animate-pulse" />
    </div>
  );
}
