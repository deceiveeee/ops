import { describe, expect, it } from "vitest";
import { canonicalUrl, classroomShareUrl, markShared, readShareMark, withoutShareMark } from "./share";

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

  it("keeps a marked link's mark inside the one parameter", () => {
    const shared = new URL(classroomShareUrl(markShared("https://example.org/lessons/if-2-2", "classroom")));
    expect([...shared.searchParams.keys()]).toEqual(["url"]);
    expect(readShareMark(new URL(shared.searchParams.get("url")!))).toBe("classroom");
  });
});

describe("canonicalUrl", () => {
  it("puts the path on the canonical origin, not the one it was opened on", () => {
    expect(canonicalUrl("/lessons/abc", new URL("https://ops.example.com"))).toBe("https://ops.example.com/lessons/abc");
  });
});

describe("share marks", () => {
  it("marks a link with how it was shared and nothing else", () => {
    expect(markShared("https://ops.example.com/daily/12", "link")).toBe("https://ops.example.com/daily/12?via=link");
    expect(markShared("https://ops.example.com/lessons/a?x=1#part", "app")).toBe("https://ops.example.com/lessons/a?x=1&via=app#part");
    // Marking twice replaces the mark rather than stacking two.
    expect(markShared(markShared("https://ops.example.com/daily/1", "app"), "link")).toBe("https://ops.example.com/daily/1?via=link");
  });

  it("reads only the marks OPS writes", () => {
    expect(readShareMark(new URL("https://ops.example.com/daily/1?via=app"))).toBe("app");
    expect(readShareMark(new URL("https://ops.example.com/daily/1?via=classroom"))).toBe("classroom");
    expect(readShareMark(new URL("https://ops.example.com/daily/1"))).toBeNull();
    expect(readShareMark(new URL("https://ops.example.com/daily/1?via=newsletter"))).toBeNull();
    expect(readShareMark(new URL("https://ops.example.com/daily/1?via="))).toBeNull();
  });

  it("takes the mark off and keeps the rest of the address", () => {
    expect(withoutShareMark(new URL("https://ops.example.com/daily/12?via=link"))).toBe("/daily/12");
    expect(withoutShareMark(new URL("https://ops.example.com/lessons/a?x=1&via=app&y=2#part"))).toBe("/lessons/a?x=1&y=2#part");
    expect(withoutShareMark(new URL("https://ops.example.com/"))).toBe("/");
  });
});
