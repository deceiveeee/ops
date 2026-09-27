import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/studio/company-search/route";

describe("company search when SEC access fails", () => {
  beforeEach(() => {
    vi.stubEnv("OPS_EDGAR_FIXTURE_DIR", "");
    vi.stubEnv("OPS_SEC_CONTACT", "directory-test@example.test");
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  const search = () => GET(new Request("http://localhost/api/studio/company-search?q=Apple"));

  it.each(["connection", "refused", "invalid JSON", "invalid structure"])("returns identifiable, dated matches on %s failure", async (failure) => {
    const fetcher = vi.fn(async () => {
      if (failure === "connection") throw new TypeError("fetch failed");
      if (failure === "refused") return new Response("Unavailable", { status: 403 });
      return new Response(failure === "invalid JSON" ? "broken" : '{"error":"service unavailable"}');
    });
    vi.stubGlobal("fetch", fetcher);
    const response = await search();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.companies[0]).toEqual({ cik: "0000320193", ticker: "AAPL", name: "Apple Inc." });
    expect(body.source).toMatchObject({ kind: "saved", url: "https://www.sec.gov/files/company_tickers.json" });
    expect(Number.isFinite(Date.parse(body.source.fetchedAt))).toBe(true);
    expect(fetcher.mock.calls).toHaveLength(1);
  });
  it("works from the public snapshot without a configured SEC contact", async () => {
    vi.stubEnv("OPS_SEC_CONTACT", "");
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect((await (await search()).json()).source.kind).toBe("saved");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("prefers the live directory when it is available", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ "0": { cik_str: 12345, ticker: "LIVE", title: "Apple test entry" } }))));
    const body = await (await search()).json();
    expect(body.companies).toEqual([{ cik: "0000012345", ticker: "LIVE", name: "Apple test entry" }]);
    expect(body.source.kind).toBe("live");
  });
  it("still rejects missing queries before reading a directory", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect((await GET(new Request("http://localhost/api/studio/company-search"))).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
