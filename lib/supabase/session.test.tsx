import { describe, it, expect } from "vitest";
import { render, renderHook, act } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SessionProvider, useSession } from "./session";

type Listener = (event: string, session: { user?: { id: string } } | null) => void;

function makeFakeClient(user?: { id: string }) {
  const listeners: Listener[] = [];
  const client = {
    auth: {
      getUser: async () => ({ data: { user: user ?? null } }),
      onAuthStateChange: (cb: Listener) => {
        listeners.push(cb);
        return { data: { subscription: { unsubscribe: () => {
          const i = listeners.indexOf(cb);
          if (i >= 0) listeners.splice(i, 1);
        } } } };
      },
    },
  } as unknown as SupabaseClient & { __emit: (e: string, s: { user?: { id: string } } | null) => void };
  (client as { __emit: (e: string, s: { user?: { id: string } } | null) => void }).__emit = (e, s) => {
    listeners.forEach((l) => l(e, s));
  };
  return client;
}

function wrapper(client: SupabaseClient) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <SessionProvider client={client}>{children}</SessionProvider>;
  }
  return Wrapper;
}

describe("SessionProvider", () => {
  it("starts loading then resolves unauthenticated", async () => {
    const client = makeFakeClient();
    const { result } = renderHook(() => useSession(), { wrapper: wrapper(client) });
    expect(result.current.status).toBe("loading");
    await act(() => Promise.resolve());
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
  });

  it("reflects emitted auth state changes", async () => {
    const client = makeFakeClient();
    const { result } = renderHook(() => useSession(), { wrapper: wrapper(client) });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    act(() => {
      (client as { __emit: (e: string, s: { user?: { id: string } } | null) => void })
        .__emit("SIGNED_IN", { user: { id: "u1" } });
    });
    expect(result.current.status).toBe("authenticated");
    expect(result.current.user?.id).toBe("u1");
  });

  it("exposes the client", () => {
    const client = makeFakeClient({ id: "u1" });
    const { result } = renderHook(() => useSession(), { wrapper: wrapper(client) });
    expect(result.current.client).toBe(client);
  });
});
