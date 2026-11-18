import { describe, expect, it } from "vitest";
import { curriculum, publicModules } from "./courseFacts";

describe("Courses page curriculum", () => {
  it("gives every public Finance Foundations module a plain line", () => {
    const items = curriculum("finance-foundations");
    expect(items.map((item) => item.number)).toEqual(publicModules("finance-foundations").map((module) => module.order));
    for (const item of items) expect(item.line, `module ${item.number} ${item.title}`).toMatch(/\w.*\.$/);
  });

  it("spells out every acronym it uses", () => {
    for (const { line } of curriculum("finance-foundations")) {
      for (const acronym of line!.match(/\b[A-Z]{2,}\b/g) ?? []) {
        expect(line, `${acronym} is used without its full name`).toMatch(new RegExp(`\(${acronym}\)`));
      }
    }
  });

  it("links each module to its place on the course page", () => {
    expect(curriculum("finance-foundations")[2].href).toBe("/courses/finance-foundations#module-3");
  });

  it("lists every available Investment Foundations mission in order, linked to its first lesson", () => {
    const items = curriculum("investment-foundations");
    expect(items).toHaveLength(13);
    expect(items[0]).toMatchObject({ number: 1, title: "Set your goal and your limits" });
    expect(items.every((item) => item.href.startsWith("/lessons/"))).toBe(true);
  });
});
