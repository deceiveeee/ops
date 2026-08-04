"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/supabase/session";
import { unionDocs, type ModuleCompletion, type ProgressDoc } from "./merge";

export type { ModuleCompletion, ProgressDoc };
export type SyncStatus = "guest" | "synced" | "saving" | "error" | "offline";

interface ProgressValue {
  ready: boolean;
  syncStatus: SyncStatus;
  getModuleCompletion: (moduleKey: string) => ModuleCompletion;
  isComplete: (moduleKey: string, slug: string) => boolean;
  markComplete: (moduleKey: string, slug: string) => void;
}

const MODULE_KEY_RE = /^ops-.*-completion-v\d+$/;
const CHANGE_EVENT = "ops-progress-change";

const Ctx = createContext<ProgressValue | null>(null);

function readLocal(): ProgressDoc {
  if (typeof window === "undefined") return {};
  const doc: ProgressDoc = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !MODULE_KEY_RE.test(key)) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      doc[key] = JSON.parse(raw) as ModuleCompletion;
    } catch {
    }
  }
  return doc;
}

function writeModuleLocal(moduleKey: string, mod: ModuleCompletion) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(moduleKey, JSON.stringify(mod));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
  }
}

const isOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const supabase = session.client;
  const liveUserId = session.user?.id ?? null;

  const [doc, setDoc] = useState<ProgressDoc>({});
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("guest");
  const docRef = useRef<ProgressDoc>({});
  const userIdRef = useRef<string | null>(liveUserId);
  useEffect(() => {
    userIdRef.current = liveUserId;
    setSyncStatus(liveUserId ? "synced" : "guest");
  }, [liveUserId]);

  const refreshFromLocal = useCallback(() => {
    const next = readLocal();
    docRef.current = next;
    setDoc(next);
  }, []);

  useEffect(() => {
    let active = true;
    const tick = setTimeout(() => {
      if (!active) return;
      refreshFromLocal();
      setReady(true);
    }, 0);
    const onChange = () => refreshFromLocal();
    const onOnline = () => setSyncStatus(userIdRef.current ? "synced" : "guest");
    const onOffline = () => setSyncStatus("offline");
    window.addEventListener("storage", onChange);
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      active = false;
      clearTimeout(tick);
      window.removeEventListener("storage", onChange);
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshFromLocal]);

  useEffect(() => {
    if (!liveUserId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("completion")
        .eq("user_id", liveUserId)
        .single();
      if (cancelled) return;
      const cloud = (!error && data?.completion) ? (data.completion as ProgressDoc) : {};
      const merged = unionDocs(readLocal(), cloud);
      docRef.current = merged;
      setDoc(merged);
      for (const key of Object.keys(merged)) {
        writeModuleLocal(key, merged[key]);
      }
      if (!error) {
        await supabase
          .from("user_progress")
          .upsert({
            user_id: liveUserId,
            completion: merged,
            updated_at: new Date().toISOString(),
          });
      }
      if (!cancelled) setSyncStatus(error ? "error" : "synced");
    })();
    return () => {
      cancelled = true;
    };
  }, [liveUserId, supabase]);

  const markComplete = useCallback(
    (moduleKey: string, slug: string) => {
      const prevMod = docRef.current[moduleKey] ?? {};
      if (prevMod[slug]) return;
      const nextMod: ModuleCompletion = { ...prevMod, [slug]: true };
      const nextDoc: ProgressDoc = { ...docRef.current, [moduleKey]: nextMod };
      docRef.current = nextDoc;
      setDoc(nextDoc);
      writeModuleLocal(moduleKey, nextMod);

      const uid = userIdRef.current;
      if (!uid) return;
      if (!isOnline()) {
        setSyncStatus("offline");
        return;
      }
      setSyncStatus("saving");
      supabase
        .from("user_progress")
        .upsert({
          user_id: uid,
          completion: nextDoc,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }: { error: unknown }) => {
          setSyncStatus(error ? "error" : "synced");
        });
    },
    [supabase],
  );

  const getModuleCompletion = useCallback(
    (moduleKey: string) => doc[moduleKey] ?? {},
    [doc],
  );
  const isComplete = useCallback(
    (moduleKey: string, slug: string) => Boolean((doc[moduleKey] ?? {})[slug]),
    [doc],
  );

  const value = useMemo<ProgressValue>(
    () => ({ ready, syncStatus, getModuleCompletion, isComplete, markComplete }),
    [ready, syncStatus, getModuleCompletion, isComplete, markComplete],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgressStore(): ProgressValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProgressStore must be used within <ProgressProvider>");
  return v;
}
