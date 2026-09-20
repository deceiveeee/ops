/**
 * Which ways of signing in this project actually has turned on.
 *
 * Offering one that is not is worse than not offering it. Pressing "Continue
 * with Google" against a project without the provider enabled does not fail
 * quietly or explain itself: the browser is sent to the authorize endpoint,
 * which answers 400 with `{"error_code":"validation_failed","msg":"Unsupported
 * provider: provider is not enabled"}` — and that raw JSON is the page the
 * person is left looking at, off the site, with no way back but the back
 * button. Checked on this project on 2026-09-19, where `google` is false.
 *
 * The settings endpoint is public: it answers with the anon key the browser
 * already carries, and says only which providers exist, never anything about a
 * person or an account.
 *
 * A failed check returns null, meaning "not known" rather than "not enabled".
 * The pages treat that as reason to keep offering the button, because a check
 * that could not run is not evidence that signing in would fail — and the click
 * path now says what went wrong rather than navigating away.
 */
export async function enabledProviders(signal?: AbortSignal): Promise<ReadonlySet<string> | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key }, signal });
    if (!response.ok) return null;
    const body = (await response.json()) as { external?: Record<string, unknown> };
    const external = body.external ?? {};
    return new Set(Object.entries(external).filter(([, on]) => on === true).map(([name]) => name));
  } catch {
    // Offline, blocked, or aborted on unmount. Not known, which is not "off".
    return null;
  }
}
