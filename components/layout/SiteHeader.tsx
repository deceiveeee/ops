"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useSession } from "@/lib/supabase/session";
import { useProgressStore } from "@/lib/progress/store";
import { syncStatusText } from "./sync-indicator";
import { GUEST_ONLY_BETA } from "@/lib/beta";

/**
 * Accounts are offered, never required. Every learner surface works signed out
 * and saves to the browser, so signing in adds carrying your work between
 * devices and takes nothing away from someone who never does. That is why the
 * sign-in control sits beside the primary action rather than in front of it,
 * and why no route redirects an anonymous visitor to it.
 *
 * Studio joined the nav when it stopped being a preview and became a working
 * workspace; the investments it cannot yet research are named inside it rather
 * than hidden.
 */
const nav = [
  { href: "/courses", label: "Courses" },
  { href: "/plan", label: "Your plan" },
  { href: "/studio", label: "Studio" },
  { href: "/filings", label: "Filings" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user, status, client } = useSession();
  const { syncStatus } = useProgressStore();
  const signedIn = status === "authenticated" && !!user;
  /**
   * The same flag the middleware reads. Without this the control would survive
   * a decision to close accounts again and send people to a route that
   * redirects them straight back out -- the flag has to govern what is offered,
   * not only what is reachable.
   */
  const accountsOffered = !GUEST_ONLY_BETA;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the homepage, the header floats transparent over the hero and only
  // gains a surface once the user scrolls past the first viewport.
  const solid = scrolled || !isHome;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Open Portfolio Studio home">
          <Logo />
          <span
            className={cn(
              "text-[17px] font-semibold tracking-[-0.015em] transition-colors",
              solid ? "text-slate-100" : "text-white",
            )}
          >
            Open Portfolio Studio
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-full px-4 py-2 text-[16px] font-medium transition-colors",
                solid
                  ? "text-slate-300 hover:bg-white/5 hover:text-white"
                  : "text-slate-200/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {accountsOffered && <SyncChip status={syncStatus} />}
          {accountsOffered &&
            (signedIn ? (
              <AccountMenu email={user!.email ?? ""} onSignOut={() => void client.auth.signOut()} />
            ) : (
              <Button href="/login" variant="outline" size="md">
                Sign in
              </Button>
            ))}
          <Button href="/courses/investment-foundations" size="md">
            Start building
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/10 text-slate-200 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink-950/95 px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Button href="/courses" variant="outline" size="sm" className="flex-1">
                Courses
              </Button>
              <Button href="/courses/investment-foundations" size="sm" className="flex-1">
                Start building
              </Button>
            </div>
            {accountsOffered && (
              <div className="mt-2">
                {signedIn ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => void client.auth.signOut()}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button href="/login" variant="outline" size="sm" className="w-full">
                    Sign in
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function SyncChip({ status }: { status: ReturnType<typeof useProgressStore>["syncStatus"] }) {
  // A guest has nothing syncing, so the chip would only be noise.
  if (status === "guest") return null;
  const { label, dot } = syncStatusText(status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[13px] text-slate-300">
      <span className={dot} />
      {label}
    </span>
  );
}

function AccountMenu({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-white/10 px-3 py-1.5 text-[14px] text-slate-200 hover:bg-white/5"
      >
        {email}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-ink-950/95 p-1">
          <Link
            href="/start?retake=1"
            onClick={() => setOpen(false)}
            className="block w-full rounded-md px-3 py-2 text-left text-[14px] text-slate-200 hover:bg-white/5"
          >
            Update my starting point
          </Link>
          <button
            onClick={onSignOut}
            className="w-full rounded-md px-3 py-2 text-left text-[14px] text-slate-200 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent-cyan">
      <path d="M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="3" cy="16" r="1.4" fill="currentColor" />
      <circle cx="21" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}
