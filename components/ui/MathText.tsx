"use client";

import { Fragment, type ReactNode } from "react";
import { InlineMath } from "@/components/ui/Math";

/**
 * Renders a prose string with inline math auto-detected and typeset via KaTeX.
 *
 * Auto-detection catches the notation patterns used across the lessons:
 *   - subscript/superscript with braces:  r_{0,T}  P^{2}  D_{N+1}
 *   - LaTeX commands:                     \hat{\beta}  \approx  \Delta
 *   - short subscripted variables:        TV_N  g_S  R_t  D_8
 *
 * The bare-variable pattern requires a non-letter boundary before it so that
 * ordinary identifiers (file_1, node_2) are not mistaken for math. Non-string
 * children (JSX) are passed through unchanged.
 */

const MATH_TEST =
  /[A-Za-z0-9)\]]?[_^]\{|\\[a-zA-Z]|(?<![A-Za-z])[A-Za-z]{1,3}_[A-Za-z0-9]/;
const MATH_RE =
  /([A-Za-z0-9)\]]?(?:[_^]\{[^{}]*\})+)|(\\[A-Za-z]+(?:\{[^{}]*\})*)|((?:^|(?<=[^A-Za-z0-9]))[A-Za-z]{1,3}_[A-Za-z0-9]+)/g;

function renderString(str: string): ReactNode {
  if (!MATH_TEST.test(str)) return str;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  MATH_RE.lastIndex = 0;
  while ((m = MATH_RE.exec(str)) !== null) {
    if (m.index > last) {
      out.push(<Fragment key={key++}>{str.slice(last, m.index)}</Fragment>);
    }
    out.push(<InlineMath key={key++}>{m[0]}</InlineMath>);
    last = m.index + m[0].length;
  }
  if (last < str.length) {
    out.push(<Fragment key={key++}>{str.slice(last)}</Fragment>);
  }
  return out;
}

export function MathText({ children }: { children: ReactNode }) {
  if (typeof children === "string") return <>{renderString(children)}</>;
  return <>{children}</>;
}
