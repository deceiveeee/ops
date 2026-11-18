"use client";

import { useEffect } from "react";
import { count } from "@/lib/counts/count";
import { pageKind } from "@/lib/counts/events";
import { recordVisit } from "@/lib/counts/visit";
import { readShareMark, withoutShareMark } from "@/lib/share";

/**
 * The two counts that belong to a visit rather than to a page: arriving from
 * a shared link, and coming back within a week. Mounted once in the root
 * layout, so it runs once per page load, not on every move between pages.
 * It renders nothing.
 */
export default function VisitCounts() {
  useEffect(() => {
    const here = new URL(window.location.href);
    const how = readShareMark(here);
    if (how) {
      count({ name: "Arrived from a share", page: pageKind(here.pathname), how });
      // Taking the mark off means a reload, or this address passed on again, is not a second arrival.
      // Keeping history.state keeps the router's own record of this page intact.
      window.history.replaceState(window.history.state, "", withoutShareMark(here));
    }
    let store: Storage | null = null;
    try {
      store = window.localStorage;
    } catch {
      // Storage blocked outright: no visit day can be kept, so there is no return to count.
    }
    if (store && recordVisit(store, new Date())) count({ name: "Came back within 7 days" });
  }, []);
  return null;
}
