"use client";

import { useState } from "react";
import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (error) return setError(authErrorMessage(error));
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <GlassPanel>
        <h1 className="font-display text-[28px] font-semibold text-slate-100">Reset your password</h1>
        {sent ? (
          <p className="mt-3 text-[16px] leading-relaxed text-slate-300">
            If an account exists for <span className="text-slate-100">{email}</span>, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-white/10 bg-ink-950/60 px-3.5 py-2.5 text-[16px] text-slate-100 outline-none focus:border-accent-cyan/60"
              />
            </label>
            {error && <p className="text-[14px] text-red-400">{error}</p>}
            <Button type="submit" size="md" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</Button>
          </form>
        )}
        <Link href="/login" className="mt-6 inline-block text-[14px] text-accent-cyan hover:underline">Back to sign in</Link>
      </GlassPanel>
    </main>
  );
}
