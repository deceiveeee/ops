"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

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
  useEffect(() => { setOpen(false); }, [pathname]);
  const matches = (href: string) => pathname === href || pathname?.startsWith(href + "/");
  // Company reports lives inside Studio, so both would match there. The most
  // specific wins, and only one place is ever marked as current.
  const active = nav.filter((item) => matches(item.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const current = (href: string) => href === active;

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
        <div className="site-desktop-action"><Button href="/studio">Open Studio</Button></div>
        <button ref={menuButton} type="button" className="site-menu-button" aria-expanded={open} aria-controls="site-mobile-nav" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"} /></svg>
        </button>
      </div>
      {open && <nav id="site-mobile-nav" aria-label="Mobile navigation" className="site-mobile-nav">
        {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={current(item.href) ? "page" : undefined}>{item.label}</Link>)}
      </nav>}
    </header>
  );
}
