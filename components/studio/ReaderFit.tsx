"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FIT_COOKIE, fitCookie, fitFor, fitsDiffer } from "@/lib/filings/fit";
import type { Fit } from "@/lib/filings/pages";

/** At most this share of a screen's height for the whole page, as the screen budget allows. */
const SCREENS = 1.5;
/**
 * Kept in hand under the budget, for the height model's rounding: at 16px a
 * tablet's fullest page measured 1.51 screens, and at 32px a page of Intel's
 * bullets on a phone did the same (2026-09-18).
 */
const SPARE_PX = 48;

/**
 * Measures the room the reader has on this screen and pages the report to it.
 *
 * The text column's width sets characters to a line; the height the page's
 * frame leaves under one and a half screens sets the page. Both go to the
 * server in a cookie. Where they differ from what this page was sized for, it
 * is paged again, staying at the same place in the report. Run again when the
 * window's width changes: a phone turned, a window drawn wider. Not for its
 * height alone, which a phone's browser changes as its address bar slides away
 * under a scrolling thumb, by more than a page is paged again for.
 */
export default function ReaderFit({ used, firstOffset }: { used: Fit; firstOffset: number | null }) {
  const router = useRouter();
  // Paging again can add or take away the page controls, which moves the frame
  // by their height; twice settles it, and a third time would be a loop.
  const repaged = useRef(0);
  const width = useRef<number | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const measure = () => {
      const text = document.querySelector<HTMLElement>("[data-reader-text]");
      // A tab drawn out of sight can report a window of nothing; that is no measurement.
      if (!text || window.innerWidth < 240 || window.innerHeight < 240 || text.clientWidth < 160) return;
      // The section's heading is drawn over the first page only, and paged as part of it.
      const heading = document.querySelector<HTMLElement>("[data-section-heading]");
      const headingPx = heading && heading.offsetHeight > 1 ? heading.offsetHeight + 12 : 0;
      const frame = document.documentElement.scrollHeight - text.offsetHeight - headingPx;
      // A paragraph is held to 68 characters' width, narrower than the column on a wide screen.
      const column = text.querySelector("p")?.clientWidth || Math.min(text.clientWidth, 643);
      const want = fitFor(column, Math.floor(window.innerHeight * SCREENS) - frame - SPARE_PX);
      document.cookie = `${FIT_COOKIE}=${fitCookie(want)}; path=/studio; max-age=31536000; samesite=lax`;
      if (!fitsDiffer(want, used) || repaged.current >= 2) return;
      repaged.current += 1;
      // Page again at the same place: the first words on this page, unless a place is already asked for.
      const url = new URL(window.location.href);
      if (!url.searchParams.has("at") && firstOffset !== null && url.searchParams.has("page")) {
        url.searchParams.delete("page");
        url.searchParams.set("at", String(firstOffset));
        router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
      } else {
        router.refresh();
      }
    };
    width.current ??= window.innerWidth;
    measure();
    const onResize = () => {
      if (window.innerWidth === width.current) return;
      width.current = window.innerWidth;
      // A new width is the reader's doing, and may be paged for afresh.
      repaged.current = 0;
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 300);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, [router, used, firstOffset]);

  return null;
}
