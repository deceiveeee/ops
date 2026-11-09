import { describe, expect, it } from "vitest";
import { pageKind, toPayload, type CountEvent } from "./events";

describe("toPayload", () => {
  it("sends each count with exactly the details it names", () => {
    expect(toPayload({ name: "First stage finished", lesson: "if-2-2-why-market-rates-change-bond-prices" })).toEqual({
      name: "First stage finished",
      props: { lesson: "if-2-2-why-market-rates-change-bond-prices" },
    });
    expect(toPayload({ name: "Lesson finished", lesson: "npv-rule" })).toEqual({ name: "Lesson finished", props: { lesson: "npv-rule" } });
    expect(toPayload({ name: "Puzzle solved", puzzle: 12, clues: 3 })).toEqual({ name: "Puzzle solved", props: { puzzle: 12, clues: 3 } });
    expect(toPayload({ name: "Shared", page: "lesson", how: "classroom" })).toEqual({ name: "Shared", props: { page: "lesson", how: "classroom" } });
    expect(toPayload({ name: "Arrived from a share", page: "puzzle", how: "app" })).toEqual({
      name: "Arrived from a share",
      props: { page: "puzzle", how: "app" },
    });
    expect(toPayload({ name: "Came back within 7 days" })).toEqual({ name: "Came back within 7 days", props: {} });
  });

  it("never carries a field the count does not name, even one passed in by mistake", () => {
    const sneaky = { name: "Lesson finished", lesson: "npv-rule", answer: "my written answer", email: "a@b.c" } as unknown as CountEvent;
    expect(toPayload(sneaky)).toEqual({ name: "Lesson finished", props: { lesson: "npv-rule" } });
    const guesses = { name: "Puzzle solved", puzzle: 3, clues: 2, guessed: ["AAPL", "MSFT"] } as unknown as CountEvent;
    expect(toPayload(guesses)?.props).toEqual({ puzzle: 3, clues: 2 });
    const noted = { name: "Came back within 7 days", lastVisit: "2026-11-01", days: 4 } as unknown as CountEvent;
    expect(toPayload(noted)?.props).toEqual({});
  });

  it("refuses a lesson that is not an address name, so free text cannot ride along", () => {
    for (const lesson of ["", "My answer was Apple", "if-2-2/../x", "IF-2-2", "a".repeat(101), "x?email=a@b.c", "trailing-"]) {
      expect(toPayload({ name: "Lesson finished", lesson }), lesson).toBeNull();
      expect(toPayload({ name: "First stage finished", lesson }), lesson).toBeNull();
    }
  });

  it("refuses puzzle numbers and clue counts outside the game's rules", () => {
    for (const [puzzle, clues] of [
      [0, 1],
      [1, 0],
      [1, 7],
      [1.5, 2],
      [100_000, 1],
      [Number.NaN, 1],
    ]) {
      expect(toPayload({ name: "Puzzle solved", puzzle, clues }), `${puzzle}/${clues}`).toBeNull();
    }
    expect(toPayload({ name: "Puzzle solved", puzzle: 1, clues: 6 })).not.toBeNull();
  });

  it("refuses share details OPS never writes", () => {
    expect(toPayload({ name: "Shared", page: "lesson", how: "email" } as unknown as CountEvent)).toBeNull();
    expect(toPayload({ name: "Arrived from a share", page: "/lessons/x", how: "link" } as unknown as CountEvent)).toBeNull();
    expect(toPayload({ name: "Something else" } as unknown as CountEvent)).toBeNull();
  });
});

describe("pageKind", () => {
  it("names the kind of page from its path alone", () => {
    expect(pageKind("/daily")).toBe("puzzle");
    expect(pageKind("/daily/12")).toBe("puzzle");
    expect(pageKind("/lessons/if-1-1-how-an-investor-builds-a-philosophy")).toBe("lesson");
    expect(pageKind("/courses/investment-foundations")).toBe("course");
    expect(pageKind("/")).toBe("other");
    expect(pageKind("/dailyish")).toBe("other");
    expect(pageKind("/studio")).toBe("other");
  });
});
