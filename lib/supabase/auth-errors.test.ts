import { describe, expect, it } from "vitest";
import {
  authErrorMessage,
  isBackendUnreachable,
  BACKEND_UNREACHABLE_MESSAGE,
} from "./auth-errors";

describe("isBackendUnreachable", () => {
  /**
   * The exact strings each browser produces when `fetch` cannot open a
   * connection. This is the case that sent a real diagnosis down the wrong path:
   * the Supabase project had been paused for a week and the only thing on screen
   * was "Failed to fetch".
   */
  it("recognises a connection failure in every browser's wording", () => {
    for (const message of [
      "Failed to fetch",
      "NetworkError when attempting to fetch resource.",
      "Load failed",
      "Network request failed",
    ]) {
      expect(isBackendUnreachable({ message })).toBe(true);
    }
  });

  it("recognises the error class supabase-js raises, whatever it says", () => {
    expect(
      isBackendUnreachable({ name: "AuthRetryableFetchError", message: "" }),
    ).toBe(true);
  });

  /**
   * The guard has to be narrow. A real auth failure that merely mentions a
   * network would otherwise be replaced by advice to check the connection,
   * which would be worse than the raw message it replaced.
   */
  it("leaves real auth failures alone", () => {
    for (const message of [
      "Invalid login credentials",
      "User already registered",
      "Password should be at least 6 characters",
      "Email not confirmed",
    ]) {
      expect(isBackendUnreachable({ message })).toBe(false);
    }
  });

  it("treats no error as reachable", () => {
    expect(isBackendUnreachable(null)).toBe(false);
    expect(isBackendUnreachable(undefined)).toBe(false);
  });
});

describe("authErrorMessage", () => {
  it("returns null when the call succeeded", () => {
    expect(authErrorMessage(null)).toBeNull();
    expect(authErrorMessage(undefined)).toBeNull();
  });

  it("explains an unreachable backend instead of quoting the browser", () => {
    expect(authErrorMessage({ message: "Failed to fetch" })).toBe(
      BACKEND_UNREACHABLE_MESSAGE,
    );
  });

  it("says the work is safe, because the course is local-first", () => {
    expect(BACKEND_UNREACHABLE_MESSAGE).toMatch(/lives in this browser/);
  });

  it("passes a real auth failure through word for word", () => {
    expect(authErrorMessage({ message: "Invalid login credentials" })).toBe(
      "Invalid login credentials",
    );
  });

  it("still says something when an error carries no message at all", () => {
    expect(authErrorMessage({})).toBe("Something went wrong. Please try again.");
  });
});
