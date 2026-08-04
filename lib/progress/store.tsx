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

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const userId = user?.id ?? null;

  const [doc, setDoc] = useState<ProgressDoc>({});
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("guest");
  const docRef = useRef<ProgressDoc>({});

  useEffect(() => {
    setSyncStatus(userId ? "synced" : "guest");
  }, [userId]);

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
    window.addEventListener("storage", onChange);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
      active = false;
      clearTimeout(tick);
      window.removeEventListener("storage", onChange);
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }, [refreshFromLocal]);

  const markComplete = useCallback(
    (moduleKey: string, slug: string) => {
      const prevMod = docRef.current[moduleKey] ?? {};
      if (prevMod[slug]) return;
      const nextMod: ModuleCompletion = { ...prevMod, [slug]: true };
      const nextDoc: ProgressDoc = { ...docRef.current, [moduleKey]: nextMod };
      docRef.current = nextDoc;
      setDoc(nextDoc);
      writeModuleLocal(moduleKey, nextMod);
    },
    [],
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
