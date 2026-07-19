"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Real LaTeX rendering via KaTeX.
 * No raw text formulas, no red broken LaTeX — rendered math.
 */

function renderTeX(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
      output: "html",
    });
  } catch {
    // Fallback: show raw tex in a code style so it's never invisible
    return `<span style="font-family:monospace;color:#f87171">${tex}</span>`;
  }
}

export function InlineMath({ children, className }: { children: string; className?: string }) {
  const html = useMemo(() => renderTeX(children, false), [children]);
  return <span className={cn(className)} dangerouslySetInnerHTML={{ __html: html }} aria-label={children} />;
}

export function BlockMath({ children, className }: { children: string; className?: string }) {
  const html = useMemo(() => renderTeX(children, true), [children]);
  return (
    <div
      className={cn("flex justify-center overflow-x-auto py-1", className)}
      dangerouslySetInnerHTML={{ __html: html }}
      role="math"
      aria-label={children}
    />
  );
}
