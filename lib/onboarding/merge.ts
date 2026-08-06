import type { OnboardingSnapshot } from "./types";

function timeOrZero(s: string | null | undefined): number {
  if (!s) return 0;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function mergeSnapshots(
  local: OnboardingSnapshot | null,
  cloud: OnboardingSnapshot | null,
): OnboardingSnapshot | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  const localCompleted = local.completed_at !== null;
  const cloudCompleted = cloud.completed_at !== null;
  if (localCompleted && !cloudCompleted) return local;
  if (cloudCompleted && !localCompleted) return cloud;

  const localTime = timeOrZero(local.updated_at);
  const cloudTime = timeOrZero(cloud.updated_at);
  return localTime >= cloudTime ? local : cloud;
}
