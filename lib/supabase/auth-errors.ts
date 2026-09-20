/**
 * Turn a Supabase auth failure into something a learner can act on.
 *
 * When the browser cannot open a connection at all, `fetch` throws and
 * supabase-js hands the browser's own words straight through: "Failed to fetch"
 * in Chrome, "NetworkError when attempting to fetch resource." in Firefox,
 * "Load failed" in Safari. None of those tell a reader whether they mistyped
 * their password, whether the service is down, or whether their wifi dropped —
 * and this app's own backend went away for a week without anyone being able to
 * tell which it was from the screen alone.
 *
 * Everything else is passed through untouched. "Invalid login credentials" and
 * "User already registered" are already the clearest available account of what
 * happened, and paraphrasing them would only blur them.
 */

/**
 * The three major browsers each word a failed connection differently, and
 * supabase-js does not normalise them. React Native's wording is included
 * because the same helper would be wrong there for no reason.
 */
const UNREACHABLE_MESSAGE =
  /failed to fetch|networkerror|load failed|network request failed/i;

/**
 * Deliberately not `instanceof AuthRetryableFetchError`. That class lives in
 * `@supabase/auth-js`, a transitive dependency this app does not declare, so
 * importing it would couple these pages to a package that can move under them.
 * The class name travels on the error itself, and the browser strings are a
 * second, independent signal — either one alone is enough.
 */
export function isBackendUnreachable(error: {
  name?: string;
  message?: string;
} | null | undefined): boolean {
  if (!error) return false;
  if (error.name === "AuthRetryableFetchError") return true;
  return UNREACHABLE_MESSAGE.test(error.message ?? "");
}

export const BACKEND_UNREACHABLE_MESSAGE =
  "We could not reach the sign-in service. Nothing you have already saved is affected — your course progress lives in this browser. Check your connection and try again; if it keeps failing, the service is probably down.";

/**
 * A provider the site offers but the project has not turned on.
 *
 * Supabase answers "Unsupported provider: provider is not enabled", which is
 * accurate and useless to a learner: it is not their mistake, there is nothing
 * for them to correct, and the thing they came to do can still be done another
 * way. So the message says whose fault it is not, and what does work.
 */
const PROVIDER_DISABLED = /provider is not enabled|unsupported provider/i;

export const PROVIDER_DISABLED_MESSAGE =
  "That way of signing in is not set up on this site yet. Use your email address and password instead — nothing else is missing.";

/** The message to show for a failed auth call, or `null` when it succeeded. */
export function authErrorMessage(
  error: { name?: string; message?: string } | null | undefined,
): string | null {
  if (!error) return null;
  if (isBackendUnreachable(error)) return BACKEND_UNREACHABLE_MESSAGE;
  if (PROVIDER_DISABLED.test(error.message ?? "")) return PROVIDER_DISABLED_MESSAGE;
  return error.message ?? "Something went wrong. Please try again.";
}
