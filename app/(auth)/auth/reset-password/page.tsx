"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getSupabaseBrowser().auth.getSession();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/login?reset=1");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <GlassPanel>
        <h1 className="font-display text-[28px] font-semibold text-slate-100">Set a new password</h1>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] text-slate-300">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="rounded-lg border border-white/10 bg-ink-950/60 px-3.5 py-2.5 text-[16px] text-slate-100 outline-none focus:border-accent-cyan/60"
            />
          </label>
          {error && <p className="text-[14px] text-red-400">{error}</p>}
          <Button type="submit" size="md" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
        </form>
      </GlassPanel>
    </main>
  );
}
