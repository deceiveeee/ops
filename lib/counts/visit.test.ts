import { describe, expect, it } from "vitest";
import { cameBackWithinWindow, daysBetween, LAST_VISIT_KEY, localDay, recordVisit } from "./visit";

function memoryStore(initial?: string) {
  const data = new Map<string, string>(initial ? [[LAST_VISIT_KEY, initial]] : []);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    data,
  };
}

describe("localDay", () => {
  it("is the browser's own calendar day", () => {
    expect(localDay(new Date(2026, 10, 8, 23, 59))).toBe("2026-11-08");
    expect(localDay(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01");
  });
});

describe("daysBetween", () => {
  it("counts calendar days across month, year and daylight-saving changes", () => {
    expect(daysBetween("2026-11-08", "2026-11-08")).toBe(0);
    expect(daysBetween("2026-10-31", "2026-11-01")).toBe(1);
    expect(daysBetween("2026-12-29", "2027-01-02")).toBe(4);
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2); // US clocks go forward on 8 March 2026
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2); // leap year
    expect(daysBetween("2026-11-08", "2026-11-01")).toBe(-7);
  });

  it("refuses something that is not a real day", () => {
    expect(daysBetween("2026-02-31", "2026-03-01")).toBeNull();
    expect(daysBetween("yesterday", "2026-03-01")).toBeNull();
    expect(daysBetween("2026-11-08T10:00", "2026-11-09")).toBeNull();
  });
});

describe("cameBackWithinWindow", () => {
  it("is yes for one to seven days, no otherwise", () => {
    expect(cameBackWithinWindow(null, "2026-11-08")).toBe(false);
    expect(cameBackWithinWindow("2026-11-08", "2026-11-08")).toBe(false);
    expect(cameBackWithinWindow("2026-11-07", "2026-11-08")).toBe(true);
    expect(cameBackWithinWindow("2026-11-01", "2026-11-08")).toBe(true);
    expect(cameBackWithinWindow("2026-10-31", "2026-11-08")).toBe(false);
    expect(cameBackWithinWindow("2026-11-09", "2026-11-08")).toBe(false); // clock set backwards
    expect(cameBackWithinWindow("garbage", "2026-11-08")).toBe(false);
  });
});

describe("recordVisit", () => {
  const nov8 = new Date(2026, 10, 8, 9, 0);

  it("says nothing on a first visit, and keeps the day", () => {
    const store = memoryStore();
    expect(recordVisit(store, nov8)).toBe(false);
    expect(store.data.get(LAST_VISIT_KEY)).toBe("2026-11-08");
  });

  it("says yes once on the first load of a day within the window, then no for the rest of that day", () => {
    const store = memoryStore("2026-11-05");
    expect(recordVisit(store, nov8)).toBe(true);
    expect(recordVisit(store, new Date(2026, 10, 8, 12, 0))).toBe(false);
    expect(recordVisit(store, new Date(2026, 10, 8, 23, 59))).toBe(false);
    expect(recordVisit(store, new Date(2026, 10, 9, 0, 1))).toBe(true);
  });

  it("says no after a gap longer than a week, and starts the window again", () => {
    const store = memoryStore("2026-10-01");
    expect(recordVisit(store, nov8)).toBe(false);
    expect(store.data.get(LAST_VISIT_KEY)).toBe("2026-11-08");
  });

  it("keeps only the day, never a time or a history", () => {
    const store = memoryStore("2026-11-05");
    recordVisit(store, nov8);
    expect([...store.data.entries()]).toEqual([[LAST_VISIT_KEY, "2026-11-08"]]);
  });

  it("says no when the browser refuses to read or keep the day", () => {
    const unreadable = { getItem: () => { throw new Error("blocked"); }, setItem: () => {} };
    expect(recordVisit(unreadable, nov8)).toBe(false);
    const unkeepable = { getItem: () => "2026-11-05", setItem: () => { throw new Error("full"); } };
    expect(recordVisit(unkeepable, nov8)).toBe(false);
  });
});
