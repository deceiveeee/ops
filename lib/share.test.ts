import { describe, expect, it } from "vitest";
import { canonicalUrl, classroomShareUrl } from "./share";

describe("classroomShareUrl", () => {
  it("passes the whole link as one encoded parameter", () => {
    const shared = classroomShareUrl("https://example.org/lessons/if-2-2?x=1&y=2");
    const parsed = new URL(shared);
    expect(parsed.origin).toBe("https://classroom.google.com");
    expect(parsed.pathname).toBe("/share");
    // A raw "&" would split the lesson link into two Classroom parameters.
    expect(parsed.searchParams.get("url")).toBe("https://example.org/lessons/if-2-2?x=1&y=2");
    expect([...parsed.searchParams.keys()]).toEqual(["url"]);
  });
});

describe("canonicalUrl", () => {
  it("puts the path on the canonical origin, not the one it was opened on", () => {
    expect(canonicalUrl("/lessons/abc", new URL("https://ops.example.com"))).toBe("https://ops.example.com/lessons/abc");
  });
});
