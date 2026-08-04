"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./client";

type Status = "loading" | "authenticated" | "unauthenticated";

interface SessionValue {
  user: User | null;
  status: Status;
  client: SupabaseClient;
}

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({
  children,
  client,
}: {
  children: ReactNode;
  client?: SupabaseClient;
}) {
  const supabase = useMemo(() => client ?? getSupabaseBrowser(), [client]);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setUser(user);
      setStatus(user ? "authenticated" : "unauthenticated");
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? "authenticated" : "unauthenticated");
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<SessionValue>(
    () => ({ user, status, client: supabase }),
    [user, status, supabase],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used within <SessionProvider>");
  return v;
}
