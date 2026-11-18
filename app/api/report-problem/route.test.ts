import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({
  insert: vi.fn(async (_row: unknown) => ({ error: null as null | { code?: string; message: string } })),
  createClient: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => {
    supabase.createClient(...args);
    return { from: (table: string) => ({ insert: (row: unknown) => supabase.insert({ table, row }) }) };
  },
}));

import { POST } from "./route";

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(new Request("http://localhost/api/report-problem", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "TestBrowser/1.0", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }));
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.example");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");
  supabase.insert.mockClear();
  supabase.insert.mockImplementation(async () => ({ error: null }));
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/report-problem", () => {
  it("stores the cleaned report in problem_reports with the public key", async () => {
    const response = await post({ message: " Overlap on phone ", page: "/studio/review?x=1", viewport: "390x844", extra: "ignored" });
    expect(response.status).toBe(200);
    expect(supabase.insert).toHaveBeenCalledWith({
      table: "problem_reports",
      row: { message: "Overlap on phone", page: "/studio/review", viewport: "390x844", browser: "TestBrowser/1.0" },
    });
    expect(supabase.createClient.mock.calls.at(-1)?.[1]).toBe("public-anon-key");
  });

  it("refuses an empty report without touching the database", async () => {
    const response = await post({ message: "  ", page: "/" });
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Write what went wrong before sending.");
    expect(supabase.insert).not.toHaveBeenCalled();
  });

  it("refuses a body that is not JSON", async () => {
    expect((await post("not json")).status).toBe(400);
    expect(supabase.insert).not.toHaveBeenCalled();
  });

  it("refuses an oversized body before reading it", async () => {
    const response = await post({ message: "x" }, { "content-length": "20000" });
    expect(response.status).toBe(413);
    expect(supabase.insert).not.toHaveBeenCalled();
  });

  it("says the report did not send when the table is missing, without logging the words", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    supabase.insert.mockImplementation(async () => ({ error: { code: "42P01", message: "relation does not exist" } }));
    const response = await post({ message: "private words", page: "/" });
    expect(response.status).toBe(502);
    expect((await response.json()).error).toMatch(/did not send/);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("42P01"));
    expect(String(log.mock.calls[0][0])).not.toContain("private words");
    log.mockRestore();
  });

  it("says the report did not send when the site has no Supabase settings", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const response = await post({ message: "x", page: "/" });
    expect(response.status).toBe(503);
    expect(supabase.insert).not.toHaveBeenCalled();
  });
});
