import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import DailyPuzzleView from "@/components/daily/DailyPuzzleView";
import VisitCounts from "@/components/counts/VisitCounts";
import ShareMenu from "@/components/share/ShareMenu";
import { PUZZLES } from "@/data/daily-puzzle/puzzles";
import { COUNT_EVENT, resetCountsForTest } from "./count";
import type { CountPayload } from "./events";
import { LAST_VISIT_KEY, localDay } from "./visit";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const PUZZLE = PUZZLES[0];
const SHARE_URL = `https://ops.example.com/daily/${PUZZLE.number}`;
const LESSON_URL = "https://ops.example.com/lessons/if-2-2-why-market-rates-change-bond-prices";

let seen: CountPayload[] = [];
const listen = (event: Event) => seen.push((event as CustomEvent<CountPayload>).detail);
const settle = () => act(() => new Promise((r) => setTimeout(r, 0)));

let writeText: ReturnType<typeof vi.fn>;
function phoneShare(result: "shared" | "closed" | null) {
  const share =
    result === null
      ? undefined
      : vi.fn(() => (result === "shared" ? Promise.resolve() : Promise.reject(new DOMException("closed", "AbortError"))));
  Object.defineProperty(navigator, "share", { value: share, configurable: true, writable: true });
  return share;
}

beforeEach(() => {
  seen = [];
  window.addEventListener(COUNT_EVENT, listen);
  writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  phoneShare(null);
});

afterEach(() => {
  window.removeEventListener(COUNT_EVENT, listen);
  resetCountsForTest();
  window.history.replaceState(null, "", "/");
});

async function openPuzzle() {
  const view = render(
    <StrictMode>
      <DailyPuzzleView puzzle={PUZZLE} isToday={false} shareUrl={SHARE_URL} />
    </StrictMode>,
  );
  await settle();
  return view;
}

async function guess(name: string) {
  const box = screen.getByRole("textbox", { name: "Your guess" });
  fireEvent.change(box, { target: { value: name } });
  fireEvent.keyDown(box, { key: "Enter" });
  await settle();
}

describe("Puzzle solved", () => {
  it("counts the solve once, with the clues that were showing and nothing about the guesses", async () => {
    await openPuzzle();
    fireEvent.click(screen.getByRole("button", { name: "Show the next clue" }));
    await guess(PUZZLE.answer.name);
    expect(screen.getByRole("heading", { name: `It was ${PUZZLE.answer.name}.` })).toBeInTheDocument();
    expect(seen).toEqual([{ name: "Puzzle solved", props: { puzzle: PUZZLE.number, clues: 2 } }]);
  });

  it("counts nothing when a solved puzzle is opened again", async () => {
    const first = await openPuzzle();
    await guess(PUZZLE.answer.name);
    first.unmount();
    seen = [];
    await openPuzzle();
    expect(screen.getByRole("heading", { name: `It was ${PUZZLE.answer.name}.` })).toBeInTheDocument();
    expect(seen).toEqual([]);
  });

  it("counts one solve when the same puzzle is solved in two tabs", async () => {
    // The second tab loaded before the first solved it, so it has not caught up.
    render(
      <>
        <DailyPuzzleView puzzle={PUZZLE} isToday={false} shareUrl={SHARE_URL} />
        <DailyPuzzleView puzzle={PUZZLE} isToday={false} shareUrl={SHARE_URL} />
      </>,
    );
    await settle();
    for (const box of screen.getAllByRole("textbox", { name: "Your guess" })) {
      fireEvent.change(box, { target: { value: PUZZLE.answer.name } });
      fireEvent.keyDown(box, { key: "Enter" });
      await settle();
    }
    expect(screen.getAllByRole("heading", { name: `It was ${PUZZLE.answer.name}.` })).toHaveLength(2);
    expect(seen.filter((s) => s.name === "Puzzle solved")).toHaveLength(1);
  });

  it("counts nothing for a puzzle given up", async () => {
    await openPuzzle();
    for (let i = 0; i < 6; i += 1) fireEvent.click(screen.getByRole("button", { name: /Show the next clue|Give up and see the answer/ }));
    await settle();
    expect(screen.getByText(/I missed it after 6 clues/)).toBeInTheDocument();
    expect(seen).toEqual([]);
  });
});

describe("Shared, from the puzzle", () => {
  it("copies a marked link and counts each share that goes through", async () => {
    await openPuzzle();
    await guess(PUZZLE.answer.name);
    seen = [];
    fireEvent.click(screen.getByRole("button", { name: "Challenge a friend" }));
    await settle();
    expect(writeText).toHaveBeenCalledTimes(1);
    const text = writeText.mock.calls[0][0] as string;
    expect(text.endsWith(`${SHARE_URL}?via=link`)).toBe(true);
    expect(text.toLowerCase()).not.toContain(PUZZLE.answer.name.toLowerCase());
    fireEvent.click(screen.getByRole("button", { name: "Challenge a friend" }));
    await settle();
    expect(seen).toEqual([
      { name: "Shared", props: { page: "puzzle", how: "link" } },
      { name: "Shared", props: { page: "puzzle", how: "link" } },
    ]);
  });

  it("counts nothing when copying is blocked", async () => {
    writeText.mockImplementation(() => Promise.reject(new Error("blocked")));
    await openPuzzle();
    await guess(PUZZLE.answer.name);
    seen = [];
    fireEvent.click(screen.getByRole("button", { name: "Challenge a friend" }));
    await settle();
    expect(screen.getByText("Copying was blocked by this browser.")).toBeInTheDocument();
    expect(seen).toEqual([]);
  });

  it("counts a share made through the phone's share sheet, and nothing when the sheet is closed", async () => {
    const share = phoneShare("shared");
    await openPuzzle();
    await guess(PUZZLE.answer.name);
    seen = [];
    fireEvent.click(screen.getByRole("button", { name: "Challenge a friend" }));
    await settle();
    expect((share!.mock.calls[0] as unknown as [{ text: string }])[0].text.endsWith(`${SHARE_URL}?via=app`)).toBe(true);
    expect(seen).toEqual([{ name: "Shared", props: { page: "puzzle", how: "app" } }]);

    phoneShare("closed");
    seen = [];
    fireEvent.click(screen.getByRole("button", { name: "Challenge a friend" }));
    await settle();
    expect(seen).toEqual([]);
    expect(writeText).not.toHaveBeenCalled();
  });
});

describe("Shared, from a lesson's Share menu", () => {
  const openMenu = async () => {
    render(<ShareMenu url={LESSON_URL} title="A lesson" label="Share this lesson" />);
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "Share this lesson" }));
  };

  it("copies the link marked as copied, and counts it", async () => {
    await openMenu();
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    await settle();
    expect(writeText).toHaveBeenCalledWith(`${LESSON_URL}?via=link`);
    expect(seen).toEqual([{ name: "Shared", props: { page: "lesson", how: "link" } }]);
  });

  it("hands Classroom the link marked as from Classroom, and counts the hand-off", async () => {
    await openMenu();
    const classroom = screen.getByRole("link", { name: /Share to Google Classroom/ });
    expect(new URL(classroom.getAttribute("href")!).searchParams.get("url")).toBe(`${LESSON_URL}?via=classroom`);
    fireEvent.click(classroom);
    expect(seen).toEqual([{ name: "Shared", props: { page: "lesson", how: "classroom" } }]);
  });

  it("counts the phone's share sheet only when something was shared", async () => {
    const share = phoneShare("shared");
    await openMenu();
    fireEvent.click(screen.getByRole("button", { name: "Share to another app" }));
    await settle();
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: `${LESSON_URL}?via=app` }));
    expect(seen).toEqual([{ name: "Shared", props: { page: "lesson", how: "app" } }]);

    phoneShare("closed");
    seen = [];
    fireEvent.click(screen.getByRole("button", { name: "Share this lesson" }));
    fireEvent.click(screen.getByRole("button", { name: "Share to another app" }));
    await settle();
    expect(seen).toEqual([]);
  });
});

describe("Arrived from a share", () => {
  it("counts the arrival once and takes the mark off the address, keeping the rest", async () => {
    window.history.replaceState(null, "", "/lessons/if-2-2-why-market-rates-change-bond-prices?x=1&via=classroom#stage");
    render(
      <StrictMode>
        <VisitCounts />
      </StrictMode>,
    );
    await settle();
    expect(seen.filter((s) => s.name === "Arrived from a share")).toEqual([
      { name: "Arrived from a share", props: { page: "lesson", how: "classroom" } },
    ]);
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(
      "/lessons/if-2-2-why-market-rates-change-bond-prices?x=1#stage",
    );
  });

  it("counts nothing for an ordinary address or a mark OPS never writes", async () => {
    window.history.replaceState(null, "", "/daily/3?via=newsletter");
    render(<VisitCounts />);
    await settle();
    expect(seen.filter((s) => s.name === "Arrived from a share")).toEqual([]);
    expect(window.location.search).toBe("?via=newsletter");
  });
});

describe("Came back within 7 days", () => {
  const daysAgo = (n: number) => localDay(new Date(Date.now() - n * 86_400_000));

  it("counts a return within the week once, and keeps only today's date", async () => {
    localStorage.setItem(LAST_VISIT_KEY, daysAgo(3));
    const first = render(
      <StrictMode>
        <VisitCounts />
      </StrictMode>,
    );
    await settle();
    first.unmount();
    render(<VisitCounts />); // another page load the same day
    await settle();
    expect(seen).toEqual([{ name: "Came back within 7 days", props: {} }]);
    expect(localStorage.getItem(LAST_VISIT_KEY)).toBe(localDay(new Date()));
  });

  it("counts nothing on a first visit or after a longer gap", async () => {
    const first = render(<VisitCounts />);
    await settle();
    first.unmount();
    localStorage.setItem(LAST_VISIT_KEY, daysAgo(9));
    render(<VisitCounts />);
    await settle();
    expect(seen).toEqual([]);
  });
});
