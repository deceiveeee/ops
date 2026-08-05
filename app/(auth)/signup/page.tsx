"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

function SignupForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  function google() {
    const supabase = getSupabaseBrowser();
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
        <GlassPanel>
          <h1 className="font-display text-[28px] font-semibold text-slate-100">Check your email</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-300">
            We sent a confirmation link to <span className="text-slate-100">{email}</span>. Click it to finish creating your account.
          </p>
          <Link href="/login" className="mt-6 inline-block text-[15px] text-accent-cyan hover:underline">
            Back to sign in
          </Link>
        </GlassPanel>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <GlassPanel>
        <h1 className="font-display text-[28px] font-semibold text-slate-100">Create your account</h1>
        <p className="mt-2 text-[15px] text-slate-400">Save your progress and pick up on any device.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-[14px] text-red-400">{error}</p>}
          <Button type="submit" size="md" className="mt-1" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>
        <div className="my-5 h-px bg-white/10" />
        <Button variant="outline" size="md" onClick={google} className="w-full">Continue with Google</Button>
        <p className="mt-6 text-[14px] text-slate-400">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent-cyan hover:underline">Sign in</Link>
        </p>
      </GlassPanel>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
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
