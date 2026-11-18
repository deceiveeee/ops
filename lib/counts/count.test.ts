import { afterEach, describe, expect, it, vi } from "vitest";
import { COUNT_EVENT, count, countFirstStage, countOnce, LEDGER_KEY, resetCountsForTest, setCountSink } from "./count";
import type { CountPayload } from "./events";

/** Every count announced on the page while `run` runs. */
function announced(run: () => void): CountPayload[] {
  const seen: CountPayload[] = [];
  const listen = (event: Event) => seen.push((event as CustomEvent<CountPayload>).detail);
  window.addEventListener(COUNT_EVENT, listen);
  try {
    run();
  } finally {
    window.removeEventListener(COUNT_EVENT, listen);
  }
  return seen;
}

afterEach(() => {
  resetCountsForTest();
  vi.restoreAllMocks();
});

describe("count", () => {
  it("hands a checked count to the sink and announces the same thing", () => {
    const sink = vi.fn();
    setCountSink(sink);
    const seen = announced(() => expect(count({ name: "Shared", page: "puzzle", how: "link" })).toBe(true));
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith("Shared", { page: "puzzle", how: "link" });
    expect(seen).toEqual([{ name: "Shared", props: { page: "puzzle", how: "link" } }]);
  });

  it("sends nothing at all for a count that fails its checks", () => {
    const sink = vi.fn();
    setCountSink(sink);
    const seen = announced(() => expect(count({ name: "Lesson finished", lesson: "Not a slug" })).toBe(false));
    expect(sink).not.toHaveBeenCalled();
    expect(seen).toEqual([]);
  });

  it("never lets a failing sink break the page", () => {
    setCountSink(() => {
      throw new Error("network down");
    });
    expect(() => count({ name: "Came back within 7 days" })).not.toThrow();
  });
});

describe("sending to Vercel Web Analytics", () => {
  type Queue = { va?: (...params: unknown[]) => void; vaq?: unknown[][] };
  const w = window as unknown as Queue;
  afterEach(() => {
    delete w.va;
    delete w.vaq;
  });

  it("queues a count made before the analytics script has loaded, for the script to send", () => {
    delete w.va;
    delete w.vaq;
    count({ name: "Arrived from a share", page: "lesson", how: "classroom" });
    count({ name: "Came back within 7 days" });
    expect(w.vaq).toEqual([
      ["event", { name: "Arrived from a share", data: { page: "lesson", how: "classroom" }, options: undefined }],
      ["event", { name: "Came back within 7 days", options: undefined }],
    ]);
  });

  it("hands a count to the script once it is running, with the same two details and nothing else", () => {
    const va = vi.fn();
    w.va = va;
    count({ name: "Puzzle solved", puzzle: 7, clues: 4 });
    expect(va).toHaveBeenCalledTimes(1);
    expect(va).toHaveBeenCalledWith("event", { name: "Puzzle solved", data: { puzzle: 7, clues: 4 }, options: undefined });
  });

  it("sends nothing to Vercel for a count that fails its checks", () => {
    const va = vi.fn();
    w.va = va;
    count({ name: "First stage finished", lesson: "my answer: apple" });
    expect(va).not.toHaveBeenCalled();
  });
});

describe("countOnce", () => {
  it("counts a key once, however often the action repeats", () => {
    const seen = announced(() => {
      expect(countFirstStage("if-2-1-reading-a-bonds-promise")).toBe(true);
      expect(countFirstStage("if-2-1-reading-a-bonds-promise")).toBe(false);
      expect(countFirstStage("if-2-1-reading-a-bonds-promise")).toBe(false);
    });
    expect(seen).toEqual([{ name: "First stage finished", props: { lesson: "if-2-1-reading-a-bonds-promise" } }]);
  });

  it("keeps the once across page loads, through the browser's storage", () => {
    countFirstStage("if-3-3-what-beta-measures");
    resetCountsForTest(); // a new page load: nothing held in memory
    const seen = announced(() => countFirstStage("if-3-3-what-beta-measures"));
    expect(seen).toEqual([]);
    expect(JSON.parse(localStorage.getItem(LEDGER_KEY)!)).toEqual({ version: 1, keys: ["first-stage:if-3-3-what-beta-measures"] });
  });

  it("counts different lessons and puzzles separately", () => {
    const seen = announced(() => {
      countFirstStage("if-1-1-how-an-investor-builds-a-philosophy");
      countFirstStage("if-1-2-where-philosophy-enters-the-investment-process");
      countOnce("puzzle:4", { name: "Puzzle solved", puzzle: 4, clues: 2 });
      countOnce("puzzle:5", { name: "Puzzle solved", puzzle: 5, clues: 6 });
    });
    expect(seen.map((s) => s.name)).toEqual(["First stage finished", "First stage finished", "Puzzle solved", "Puzzle solved"]);
  });

  it("still counts once within the page when storage refuses writes", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const seen = announced(() => {
      countFirstStage("if-4-1-the-three-financial-statements");
      countFirstStage("if-4-1-the-three-financial-statements");
    });
    expect(seen).toHaveLength(1);
  });

  it("ignores a stored record it cannot read rather than failing", () => {
    localStorage.setItem(LEDGER_KEY, "{not json");
    expect(announced(() => countFirstStage("if-5-1-estimate-a-valuation-range"))).toHaveLength(1);
    localStorage.setItem(LEDGER_KEY, JSON.stringify({ version: 2, keys: ["first-stage:if-6-1-count-the-friction"] }));
    expect(announced(() => countFirstStage("if-6-1-count-the-friction"))).toHaveLength(1);
  });

  it("does not remember a refused count, and refuses keys that could hold free text", () => {
    expect(countFirstStage("Not A Slug")).toBe(false);
    expect(localStorage.getItem(LEDGER_KEY)).toBeNull();
    expect(countOnce("puzzle:my answer was apple", { name: "Puzzle solved", puzzle: 1, clues: 1 })).toBe(false);
    expect(localStorage.getItem(LEDGER_KEY)).toBeNull();
  });

  it("keeps the record bounded", () => {
    const keys = Array.from({ length: 520 }, (_, i) => `puzzle:${i + 1}`);
    localStorage.setItem(LEDGER_KEY, JSON.stringify({ version: 1, keys }));
    countOnce("puzzle:9999", { name: "Puzzle solved", puzzle: 9999, clues: 1 });
    const stored = JSON.parse(localStorage.getItem(LEDGER_KEY)!).keys as string[];
    expect(stored).toHaveLength(500);
    expect(stored.at(-1)).toBe("puzzle:9999");
  });
});
