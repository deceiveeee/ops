import type { OnboardingSnapshot } from "./types";

export const ONBOARDING_LS_KEY = "ops-onboarding-v1";
export const ONBOARDING_CHANGE_EVENT = "ops-onboarding-change";

export function readLocalSnapshot(): OnboardingSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ONBOARDING_LS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as OnboardingSnapshot;
  } catch {
    return null;
  }
}

export function writeLocalSnapshot(snap: OnboardingSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_LS_KEY, JSON.stringify(snap));
    window.dispatchEvent(new Event(ONBOARDING_CHANGE_EVENT));
  } catch {
    // storage full or unavailable; silently ignore
  }
}

export function clearLocalSnapshot(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDING_LS_KEY);
  window.dispatchEvent(new Event(ONBOARDING_CHANGE_EVENT));
}
