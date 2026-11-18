import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReportProblem from "./ReportProblem";

const route = vi.hoisted(() => ({ pathname: "/lessons/what-is-finance-value-time-risk" }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => route.pathname,
}));

// jsdom has <dialog> but not its modal methods.
beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & { showModal: () => void; close: () => void };
  proto.showModal = function showModal(this: HTMLDialogElement) { this.setAttribute("open", ""); };
  proto.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(() => vi.unstubAllGlobals());

function openForm() {
  render(<ReportProblem />);
  fireEvent.click(screen.getByRole("button", { name: "Report a problem" }));
  return screen.getByRole("textbox", { name: "What happened?" });
}

describe("ReportProblem", () => {
  it("sends the words, the page path and the screen size, then confirms", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const field = openForm();
    expect(screen.getByText(/\(\/lessons\/what-is-finance-value-time-risk\)/)).toBeInTheDocument();

    fireEvent.change(field, { target: { value: "The chart covers the Next button." } });
    fireEvent.click(screen.getByRole("button", { name: "Send report" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Report sent. Thank you.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/report-problem");
    expect(JSON.parse(String(init.body))).toEqual({
      message: "The chart covers the Next button.",
      page: "/lessons/what-is-finance-value-time-risk",
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "Close" })).toHaveFocus());
  });

  it("does not send an empty report and says what is missing", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const field = openForm();
    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Send report" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Write what went wrong before sending.");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the words and offers the terms page when the report cannot be stored", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "The report did not send. Try again in a minute, or write to the address on the terms page." }), { status: 502 })));
    const field = openForm();
    fireEvent.change(field, { target: { value: "Numbers overlap on my phone." } });
    fireEvent.click(screen.getByRole("button", { name: "Send report" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("did not send");
    expect(screen.getByRole("link", { name: "Terms page" })).toHaveAttribute("href", "/terms");
    expect(field).toHaveValue("Numbers overlap on my phone.");
  });

  it("explains a lost connection the same way", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    const field = openForm();
    fireEvent.change(field, { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Send report" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Check your connection");
  });

  it("starts a fresh report after one was sent, and keeps an unsent one", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    let field = openForm();
    fireEvent.change(field, { target: { value: "Unsent words" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Report a problem" }));
    field = screen.getByRole("textbox", { name: "What happened?" });
    expect(field).toHaveValue("Unsent words");

    fireEvent.click(screen.getByRole("button", { name: "Send report" }));
    fireEvent.click(await screen.findByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Report a problem" }));
    expect(screen.getByRole("textbox", { name: "What happened?" })).toHaveValue("");
  });
});
