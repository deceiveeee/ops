import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { DEFAULT_FIT } from "@/lib/filings/pages";

/**
 * Paging again, and the one moment it must not.
 *
 * The reader opens sized for 1440 and is paged again once the browser reports
 * its own column and the room its frame leaves. That second paging redraws the
 * paragraphs, and a redraw drops the browser's selection — so a learner who had
 * highlighted a sentence to keep it would press Keep and store the whole
 * paragraph instead. Found on 2026-09-20, when three reader tests failed on a
 * cold build: "keeps just the words selected inside a paragraph" stored all of
 * it, because the measurement landed between the selection and the click.
 *
 * Driven here rather than in a browser because the race is what matters: a
 * Playwright test would have to win it on purpose to prove anything, and the
 * one written first passed with the guard taken out.
 */

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

import ReaderFit from "./ReaderFit";

/** A reader on screen: a column of real width, inside a frame with room to spare. */
function drawReader() {
  document.body.innerHTML = `<div data-reader-text><p id="para">A paragraph of the company's own words.</p></div>`;
  const text = document.querySelector<HTMLElement>("[data-reader-text]")!;
  const paragraph = document.querySelector<HTMLElement>("#para")!;
  Object.defineProperty(text, "clientWidth", { value: 360, configurable: true });
  Object.defineProperty(text, "offsetHeight", { value: 600, configurable: true });
  Object.defineProperty(paragraph, "clientWidth", { value: 360, configurable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", { value: 900, configurable: true });
  return { text, paragraph };
}

/** Hold the paragraph's words, as someone selecting a sentence to keep would. */
function hold(paragraph: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}

describe("paging the reader to the screen it is on", () => {
  beforeEach(() => {
    replace.mockReset();
    refresh.mockReset();
    window.innerWidth = 390;
    window.innerHeight = 844;
    document.cookie = "ops-reader-fit=; max-age=0; path=/studio";
  });

  afterEach(() => {
    window.getSelection()?.removeAllRanges();
    document.body.innerHTML = "";
  });

  it("pages again once it has measured a screen the page was not sized for", async () => {
    drawReader();

    render(<ReaderFit used={{ ...DEFAULT_FIT, headingFirst: true }} firstOffset={null} />);

    // Nothing is asked for by place here, so the page is simply drawn again.
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("leaves the page alone while the reader is holding words", async () => {
    const { paragraph } = drawReader();
    hold(paragraph);

    render(<ReaderFit used={{ ...DEFAULT_FIT, headingFirst: true }} firstOffset={null} />);

    /*
     * The measurement is still written to the cookie, so the next page this
     * reader opens is sized for the screen either way. (It is written for
     * /studio, and this document is at /, so jsdom keeps it out of
     * `document.cookie` — which is why the cookie is not what is asserted.)
     * What must not happen is the redraw under the learner's hands.
     */
    await new Promise((settle) => setTimeout(settle, 100));
    expect(refresh).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(window.getSelection()?.toString()).toContain("company");
  });

  it("pages again for a selection somewhere else on the page", async () => {
    drawReader();
    document.body.insertAdjacentHTML("beforeend", "<p id='elsewhere'>A heading above the reader.</p>");
    hold(document.querySelector<HTMLElement>("#elsewhere")!);

    render(<ReaderFit used={{ ...DEFAULT_FIT, headingFirst: true }} firstOffset={null} />);

    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
