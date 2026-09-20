"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { enabledProviders } from "@/lib/supabase/providers";

/** What came back from the sign-in that sent the browser away and back again. */
const RETURNED_MESSAGE =
  "That sign-in did not finish, so nothing has changed. Try again, or use your email address and password.";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // The callback route sends a failed round trip back here. Saying nothing
  // about it leaves someone looking at the form they just came from, wondering
  // whether they are signed in.
  const [error, setError] = useState<string | null>(params.get("error") ? RETURNED_MESSAGE : null);
  const [busy, setBusy] = useState(false);
  /*
   * Offered only where the project has it. "checking" is the moment before the
   * answer arrives and "unknown" is a check that could not run, which is not
   * the same as off: a button that might work is better than one silently
   * withheld because the network hiccuped.
   */
  const [google, setGoogle] = useState<"checking" | "on" | "off" | "unknown">("checking");

  useEffect(() => {
    const abort = new AbortController();
    void enabledProviders(abort.signal).then((providers) => {
      if (abort.signal.aborted) return;
      setGoogle(providers === null ? "unknown" : providers.has("google") ? "on" : "off");
    });
    return () => abort.abort();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(authErrorMessage(error));
    router.push(next);
  }

  /*
   * The address is asked for first, and only then is the browser sent to it.
   *
   * Left to redirect on its own, a provider the project has not enabled takes
   * the person off the site to the authorize endpoint's raw 400 JSON, with the
   * back button as the only way home. Asking first keeps a failure on this page
   * and in words.
   */
  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });
    setBusy(false);
    if (error || !data?.url) {
      setError(authErrorMessage(error) ?? "That sign-in could not be started. Try again in a moment.");
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <GlassPanel>
        <h1 className="font-display text-[28px] font-semibold text-slate-100">Sign in</h1>
        <p className="mt-2 text-[15px] text-slate-400">Sync your progress to the cloud.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-[14px] text-red-400">{error}</p>}
          <Button type="submit" size="md" className="mt-1" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        {google === "on" || google === "unknown" ? (
          <>
            <div className="my-5 h-px bg-white/10" />
            <Button variant="outline" size="md" onClick={() => void signInWithGoogle()} disabled={busy} className="w-full">
              Continue with Google
            </Button>
          </>
        ) : null}
        <div className="mt-6 flex items-center justify-between text-[14px] text-slate-400">
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent-cyan hover:underline">Create account</Link>
          <Link href="/forgot-password" className="text-accent-cyan hover:underline">Forgot password?</Link>
        </div>
      </GlassPanel>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function Field({
  label, type, value, onChange,
}: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="rounded-lg border border-white/10 bg-ink-950/60 px-3.5 py-2.5 text-[16px] text-slate-100 outline-none focus:border-accent-cyan/60"
      />
    </label>
  );
}
