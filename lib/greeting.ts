"use client";

import { useEffect, useState } from "react";

/**
 * A time-of-day greeting, read from the visitor's own clock.
 *
 * It can only be worked out in the browser: the server does not know the
 * visitor's time zone, and a greeting rendered there would be wrong for most
 * of the world and would not match what the browser draws. So the hook
 * returns null on the server and on the first client render, then the
 * greeting. Callers hold the space so nothing moves when it arrives.
 */
export type DayPart = "morning" | "afternoon" | "evening";

/** Morning 5:00-11:59, afternoon 12:00-17:59, evening otherwise (including the small hours). */
export function dayPart(date: Date): DayPart {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

export function greeting(date: Date): string {
  return `Good ${dayPart(date)}`;
}

export function useGreeting(): string | null {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setText(greeting(new Date()));
    update();
    // A tab left open from the afternoon should not still say "Good afternoon" at night.
    const timer = window.setInterval(update, 5 * 60_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return text;
}
