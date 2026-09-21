"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { GUEST_ONLY_BETA } from "@/lib/beta";
import { useProgressStore } from "@/lib/progress/store";
import { useSession } from "@/lib/supabase/session";
import { syncStatusText } from "./sync-indicator";

/**
 * Accounts are offered, never required. Every learner surface works signed out
 * and saves to the browser, so signing in adds carrying your work between
 * devices and takes nothing away from someone who never does. That is why the
 * sign-in control sits beside the primary action rather than in front of it,
 * and why no route redirects an anonymous visitor to it.
 */
const nav = [
  { href: "/courses", label: "Courses" },
  { href: "/studio", label: "Studio" },
  { href: "/plan", label: "Your plan" },
  { href: "/studio/filings", label: "Company reports" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
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
  useEffect(() => { setOpen(false); }, [pathname]);
  const matches = (href: string) => pathname === href || pathname?.startsWith(href + "/");
  // Company reports lives inside Studio, so both would match there. The most
  // specific wins, and only one place is ever marked as current.
  const active = nav.filter((item) => matches(item.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const current = (href: string) => href === active;
  const signOut = () => void client.auth.signOut();

  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === "Escape" && open) { setOpen(false); menuButton.current?.focus(); }
    }}>
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="Investing Studio home">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <path d="M3 19V7M3 19h20M7 15l5-6 4 3 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Investing Studio</span>
        </Link>
        <nav aria-label="Main navigation" className="site-desktop-nav">
          {nav.map((item) => <Link key={item.href} href={item.href} aria-current={current(item.href) ? "page" : undefined}>{item.label}</Link>)}
        </nav>
        <div className="site-desktop-action">
          {accountsOffered && <SyncChip status={syncStatus} />}
          {accountsOffered && (signedIn
            ? <AccountMenu email={user!.email ?? ""} onSignOut={signOut} />
            : <Button href="/login" variant="outline">Sign in</Button>)}
          <Button href="/studio">Open Studio</Button>
        </div>
        <button ref={menuButton} type="button" className="site-menu-button" aria-expanded={open} aria-controls="site-mobile-nav" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"} /></svg>
        </button>
      </div>
      {open && <nav id="site-mobile-nav" aria-label="Mobile navigation" className="site-mobile-nav">
        {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={current(item.href) ? "page" : undefined}>{item.label}</Link>)}
        {accountsOffered && (signedIn
          ? <button type="button" className="site-mobile-account" onClick={() => { setOpen(false); signOut(); }}>Sign out</button>
          : <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>)}
      </nav>}
    </header>
  );
}

function SyncChip({ status }: { status: ReturnType<typeof useProgressStore>["syncStatus"] }) {
  // A guest has nothing syncing, so the chip would only be noise.
  if (status === "guest") return null;
  const { label, dot } = syncStatusText(status);
  return (
    <span className="site-sync">
      <span className={dot} />
      {label}
    </span>
  );
}

function AccountMenu({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="site-account">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {email}
      </button>
      {open && (
        <div className="site-account-menu">
          <Link href="/start?retake=1" onClick={() => setOpen(false)}>
            Update my starting point
          </Link>
          <button type="button" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
