import { describe, it, expect } from "vitest";
import { unionDocs } from "./merge";

describe("unionDocs", () => {
  it("returns empty for two empty docs", () => {
    expect(unionDocs({}, {})).toEqual({});
  });

  it("returns the union of disjoint modules", () => {
    const a = { "ops-m3-completion-v1": { lesson1: true } };
    const b = { "ops-m8-completion-v1": { lesson2: true } };
    expect(unionDocs(a, b)).toEqual({
      "ops-m3-completion-v1": { lesson1: true },
      "ops-m8-completion-v1": { lesson2: true },
    });
  });

  it("unifies flags within the same module", () => {
    const a = { "ops-m3-completion-v1": { a: true } };
    const b = { "ops-m3-completion-v1": { b: true } };
    expect(unionDocs(a, b)).toEqual({
      "ops-m3-completion-v1": { a: true, b: true },
    });
  });

  it("never clears a true flag (monotonic)", () => {
    const a = { "ops-m3-completion-v1": { a: true } };
    const b = { "ops-m3-completion-v1": { a: false } };
    expect(unionDocs(a, b)).toEqual({
      "ops-m3-completion-v1": { a: true },
    });
  });

  it("is idempotent", () => {
    const a = { "ops-m3-completion-v1": { a: true } };
    const b = { "ops-m8-completion-v1": { b: true } };
    const u = unionDocs(a, b);
    expect(unionDocs(u, u)).toEqual(u);
  });

  it("handles a module present only on one side", () => {
    const a = { "ops-m3-completion-v1": { a: true } };
    expect(unionDocs(a, {})).toEqual(a);
    expect(unionDocs({}, a)).toEqual(a);
  });
});
